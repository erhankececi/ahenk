// Ahenk — WebRTC arama yöneticisi (P2P medya). Sinyalizasyon: Supabase Realtime
// broadcast (kanal: call-<callId>). Medya sunucudan GEÇMEZ; yalnız SDP/ICE sinyali.
// STUN ücretsiz (Google); TURN env'den (NAT arkası için CALLS.md'ye bak).
import type { SupabaseClient } from "@supabase/supabase-js";

export type CallSignal =
  | { kind: "ready" }
  | { kind: "offer"; sdp: RTCSessionDescriptionInit }
  | { kind: "answer"; sdp: RTCSessionDescriptionInit }
  | { kind: "ice"; candidate: RTCIceCandidateInit }
  | { kind: "end" };

function iceServers(): RTCIceServer[] {
  const list: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
  const turn = process.env.NEXT_PUBLIC_TURN_URL;
  if (turn) {
    list.push({
      urls: turn,
      username: process.env.NEXT_PUBLIC_TURN_USER,
      credential: process.env.NEXT_PUBLIC_TURN_CRED,
    });
  }
  return list;
}

export class CallManager {
  private pc: RTCPeerConnection | null = null;
  private channel: any = null;
  private pending: RTCIceCandidateInit[] = [];
  private remoteSet = false;
  private facing: "user" | "environment" = "user";
  local: MediaStream | null = null;
  remote: MediaStream | null = null;
  onRemote?: (s: MediaStream) => void;
  onEnded?: () => void;

  constructor(
    private supabase: SupabaseClient,
    private callId: string,
    private video: boolean,
    private quality: "sd" | "hd" | "fhd" = "hd"
  ) {}

  private newPc() {
    const pc = new RTCPeerConnection({ iceServers: iceServers() });
    pc.onicecandidate = (e) => {
      if (e.candidate) this.send({ kind: "ice", candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      this.remote = e.streams[0];
      this.onRemote?.(e.streams[0]);
    };
    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        // bağlantı koptu — UI end_call'ı tetikler
      }
    };
    return pc;
  }

  private videoRes() {
    if (this.quality === "fhd") return { width: { ideal: 1920 }, height: { ideal: 1080 } };
    if (this.quality === "hd") return { width: { ideal: 1280 }, height: { ideal: 720 } };
    return {};
  }

  private async getMedia() {
    this.local = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: this.video ? { facingMode: this.facing, ...this.videoRes() } : false,
    });
    return this.local;
  }

  private send(sig: CallSignal) {
    this.channel?.send({ type: "broadcast", event: "sig", payload: sig });
  }

  private async applyRemote(desc: RTCSessionDescriptionInit) {
    await this.pc!.setRemoteDescription(desc);
    this.remoteSet = true;
    for (const c of this.pending) {
      try {
        await this.pc!.addIceCandidate(c);
      } catch {
        /* yoksay */
      }
    }
    this.pending = [];
  }

  private async addIce(c: RTCIceCandidateInit) {
    if (!this.remoteSet) {
      this.pending.push(c);
      return;
    }
    try {
      await this.pc!.addIceCandidate(c);
    } catch {
      /* yoksay */
    }
  }

  private subscribe(onSig: (s: CallSignal) => void): Promise<void> {
    this.channel = this.supabase.channel(`call-${this.callId}`, {
      config: { broadcast: { ack: false } },
    });
    this.channel.on("broadcast", { event: "sig" }, (msg: any) => onSig(msg.payload as CallSignal));
    return new Promise((resolve) => {
      this.channel.subscribe((status: string) => {
        if (status === "SUBSCRIBED") resolve();
      });
    });
  }

  /** Arayan: kanala katıl, callee 'ready' deyince offer gönder. */
  async startAsCaller() {
    await this.subscribe(async (s) => {
      if (s.kind === "ready") {
        this.pc = this.newPc();
        (await this.getMedia()).getTracks().forEach((t) => this.pc!.addTrack(t, this.local!));
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        this.send({ kind: "offer", sdp: offer });
      } else if (s.kind === "answer") {
        await this.applyRemote(s.sdp);
      } else if (s.kind === "ice") {
        await this.addIce(s.candidate);
      } else if (s.kind === "end") {
        this.cleanup();
        this.onEnded?.();
      }
    });
  }

  /** Aranan: medyayı hazırla, offer'ı bekle, answer gönder. Sonra 'ready' yayınla. */
  async startAsCallee() {
    this.pc = this.newPc();
    (await this.getMedia()).getTracks().forEach((t) => this.pc!.addTrack(t, this.local!));
    await this.subscribe(async (s) => {
      if (s.kind === "offer") {
        await this.applyRemote(s.sdp);
        const ans = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(ans);
        this.send({ kind: "answer", sdp: ans });
      } else if (s.kind === "ice") {
        await this.addIce(s.candidate);
      } else if (s.kind === "end") {
        this.cleanup();
        this.onEnded?.();
      }
    });
    this.send({ kind: "ready" });
  }

  setMic(on: boolean) {
    this.local?.getAudioTracks().forEach((t) => (t.enabled = on));
  }
  setCam(on: boolean) {
    this.local?.getVideoTracks().forEach((t) => (t.enabled = on));
  }

  /** Ön/arka kamera değiştir (yalnız görüntülü). */
  async switchCamera() {
    if (!this.video || !this.pc) return;
    this.facing = this.facing === "user" ? "environment" : "user";
    try {
      const ns = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: this.facing } });
      const nt = ns.getVideoTracks()[0];
      const sender = this.pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && nt) {
        await sender.replaceTrack(nt);
        this.local?.getVideoTracks().forEach((t) => {
          t.stop();
          this.local?.removeTrack(t);
        });
        this.local?.addTrack(nt);
      }
    } catch {
      /* yoksay */
    }
  }

  /** Karşı tarafa 'end' yolla (kapatma sinyali). */
  signalEnd() {
    this.send({ kind: "end" });
  }

  cleanup() {
    this.local?.getTracks().forEach((t) => t.stop());
    try {
      this.pc?.close();
    } catch {
      /* yoksay */
    }
    if (this.channel) this.supabase.removeChannel(this.channel);
    this.pc = null;
    this.channel = null;
    this.local = null;
    this.remote = null;
  }
}
