//AudioMgr.ts
import { AudioClip, AudioSource, director, Node } from "cc";
import { YResHandle } from "./ResManager";
/**
 * @en
 * this is a sington class for audio play, can be easily called from anywhere in you project.
 * @zh
 * 这是一个用于播放音频的单件类，可以很方便地在项目的任何地方调用。
 */
export class AudioManager {
  private _audioSource: AudioSource;
  constructor() {
    console.log("AudioManager init");
  }
  init() {
    //@en create a node as audioMgr
    //@zh 创建一个节点作为 audioMgr
    let audioMgr = new Node();
    audioMgr.name = "__audioMgr__";

    //@en add to the scene.
    //@zh 添加节点到场景
    console.log("director.getScene()", director.getScene());
    director.getScene().addChild(audioMgr);

    //@en make it as a persistent node, so it won't be destroied when scene change.
    //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
    director.addPersistRootNode(audioMgr);

    //@en add AudioSource componrnt to play audios.
    //@zh 添加 AudioSource 组件，用于播放音频。
    this._audioSource = audioMgr.addComponent(AudioSource);
  }

  public get audioSource() {
    return this._audioSource;
  }

  /**
   * @en
   * play short audio, such as strikes,explosions
   * @zh
   * 播放短音频,比如 打击音效，爆炸音效等
   * @param sound clip or url for the audio
   * @param volume
   */
  playOneShot(sound: AudioClip, volume: number = 1.0) {
    this._audioSource.playOneShot(sound, volume);
  }

  async playOneShotByBundle(
    bundle: string,
    sound: string,
    volume: number = 1.0,
  ) {
    let clip = await YResHandle.loadAudio(bundle, sound);
    this._audioSource.playOneShot(clip, volume);
  }

  /**
   * @en
   * play long audio, such as the bg music
   * @zh
   * 播放长音频，比如 背景音乐
   * @param sound clip or url for the sound
   * @param volume
   */
  play(sound: AudioClip, volume: number = 1.0) {
    this._audioSource.stop();
    this._audioSource.clip = sound;
    this._audioSource.play();
    this.audioSource.volume = volume;
    this._audioSource.loop = true;
  }

  async playByBundle(bundle: string, sound: string, volume: number = 1.0) {
    let clip = await YResHandle.loadAudio(bundle, sound);
    console.log(clip);
    this._audioSource.stop();
    this._audioSource.clip = clip;
    this._audioSource.play();
    this.audioSource.volume = volume;
    this._audioSource.loop = true;
  }

  /**
   * stop the audio play
   */
  stop() {
    this._audioSource.stop();
  }

  /**
   * pause the audio play
   */
  pause() {
    this._audioSource.pause();
  }

  /**
   * resume the audio play
   */
  resume() {
    this._audioSource.play();
  }
}

export const YAudioHandle = new AudioManager();
