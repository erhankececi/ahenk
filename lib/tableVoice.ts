// Ahenk — masa içi çok-kişili sesli sohbet (WebRTC mesh, 2-4 kişi).
// Sinyalleşme Supabase Realtime broadcast (kanal: tablevoice-<tableId>).
// Başlatan kuralı: küçük userId teklif verir (çift-teklif yok).
// onLevels(seat -> 0..1) ile konuşan avatar animasyonu beslenir.

const ICE: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
  ],
};

type Peer = { pc: RTCPeerConnection; seat: number; stream?: MediaStream; analyser?: AnalyserNode };

export class TableVoice {
  private supabase: any;
  private tableId: string;
  private myId: string;
  private mySeat: number;
  private ch: any = null;
  private local: MediaStream | null = null;
  private peers = new Map<string, Peer>();
  private audioCtx: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private raf = 0;
  onLevels: (levels: Record<number, number>) => void = () => {};
  micOn = true;

  constructor(supabase: any, tableId: string, myId: string, mySeat: number) {
    this.supabase = supabase; this.tableId = tableId; this.myId = myId; this.mySeat = mySeat;
  }

  async start() {
    this.local = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.localAnalyser = this.makeAnalyser(this.local);

    this.ch = this.supabase.channel(`tablevoice-${this.tableId}`, { config: { broadcast: { self: false } } });
    this.ch.on("broadcast", { event: "sig" }, ({ payload }: any) => this.onSignal(payload));
    this.ch.subscribe((st: string) => {
      if (st === "SUBSCRIBED") this.send({ t: "hello", from: this.myId, seat: this.mySeat });
    });
    this.loop();
  }

  private makeAnalyser(stream: MediaStream): AnalyserNode {
    const src = this.audioCtx!.createMediaStreamSource(stream);
    const an = this.audioCtx!.createAnalyser();
    an.fftSize = 256;
    src.connect(an);
    return an;
  }

  private levelOf(an?: AnalyserNode): number {
    if (!an) return 0;
    const data = new Uint8Array(an.frequencyBinCount);
    an.getByteFrequencyData(data);
    let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i];
    return Math.min(1, sum / data.length / 90);
  }

  private loop = () => {
    const levels: Record<number, number> = {};
    levels[this.mySeat] = this.micOn ? this.levelOf(this.localAnalyser || undefined) : 0;
    this.peers.forEach((p) => { levels[p.seat] = this.levelOf(p.analyser); });
    this.onLevels(levels);
    this.raf = requestAnimationFrame(this.loop);
  };

  private send(payload: any) { this.ch?.send({ type: "broadcast", event: "sig", payload }); }

  private async onSignal(m: any) {
    if (!m || m.to && m.to !== this.myId) {
      if (m?.to && m.to !== this.myId) return;
    }
    if (m.from === this.myId) return;

    if (m.t === "hello" || m.t === "hi") {
      if (m.t === "hello") this.send({ t: "hi", from: this.myId, seat: this.mySeat });
      // küçük id teklif verir
      if (this.myId < m.from && !this.peers.has(m.from)) await this.connect(m.from, m.seat, true);
      else if (!this.peers.has(m.from)) this.ensurePeer(m.from, m.seat); // büyük id: bekle
      return;
    }
    if (m.to !== this.myId) return;
    const peer = this.peers.get(m.from) || this.ensurePeer(m.from, m.seat);
    if (m.t === "offer") {
      await peer.pc.setRemoteDescription(m.sdp);
      const ans = await peer.pc.createAnswer();
      await peer.pc.setLocalDescription(ans);
      this.send({ t: "answer", from: this.myId, to: m.from, sdp: ans });
    } else if (m.t === "answer") {
      await peer.pc.setRemoteDescription(m.sdp);
    } else if (m.t === "ice" && m.cand) {
      try { await peer.pc.addIceCandidate(m.cand); } catch {}
    }
  }

  private ensurePeer(id: string, seat: number): Peer {
    let p = this.peers.get(id);
    if (p) return p;
    const pc = new RTCPeerConnection(ICE);
    this.local?.getTracks().forEach((t) => pc.addTrack(t, this.local!));
    pc.onicecandidate = (e) => { if (e.candidate) this.send({ t: "ice", from: this.myId, to: id, cand: e.candidate }); };
    pc.ontrack = (e) => {
      const peer = this.peers.get(id);
      if (peer) {
        peer.stream = e.streams[0];
        peer.analyser = this.makeAnalyser(e.streams[0]);
        // sesi çal
        const a = new Audio(); a.srcObject = e.streams[0]; a.autoplay = true; a.play?.().catch(() => {});
      }
    };
    p = { pc, seat };
    this.peers.set(id, p);
    return p;
  }

  private async connect(id: string, seat: number, initiator: boolean) {
    const p = this.ensurePeer(id, seat);
    if (initiator) {
      const offer = await p.pc.createOffer();
      await p.pc.setLocalDescription(offer);
      this.send({ t: "offer", from: this.myId, to: id, sdp: offer });
    }
  }

  setMic(on: boolean) {
    this.micOn = on;
    this.local?.getAudioTracks().forEach((t) => (t.enabled = on));
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.peers.forEach((p) => p.pc.close());
    this.peers.clear();
    this.local?.getTracks().forEach((t) => t.stop());
    this.audioCtx?.close().catch(() => {});
    if (this.ch) this.supabase.removeChannel(this.ch);
  }
}
