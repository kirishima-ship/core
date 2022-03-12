import { Kirishima } from './Kirishima';
import type { KirishimaPlayerOptions } from '../typings/index';
import type { KirishimaNode } from '../index';
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from 'discord-api-types/gateway/v9';
import {
	ChannelMixEqualizer,
	DistortionEqualizer,
	Equalizer,
	KaraokeEqualizer,
	LowPassEqualizer,
	RotationEqualizer,
	TimeScaleEqualizer,
	TremoloEqualizer,
	VibratoEqualizer,
	WebsocketOpEnum
} from 'lavalink-api-types';
import { KirishimaTrack } from './Track/KirishimaTrack';
import { KirishimaFilter, KirishimaFilterOptions } from './KirishimaFilter';
import { Structure } from './Structure';

export class KirishimaPlayer {
	public voiceServer: GatewayVoiceServerUpdateDispatch['d'] | undefined;
	public voiceState: GatewayVoiceStateUpdateDispatch['d'] | undefined;
	public filters = new (Structure.get('KirishimaFilter'))();
	public constructor(public options: KirishimaPlayerOptions, public kirishima: Kirishima, public node: KirishimaNode) {}

	public async connect(): Promise<KirishimaPlayer> {
		await this.kirishima.options.send(this.options.guildId, Kirishima.createVoiceChannelPayload(this.options));
		return this;
	}

	public async disconnect(): Promise<KirishimaPlayer> {
		await this.kirishima.options.send(this.options.guildId, Kirishima.createVoiceChannelPayload(this.options, true));
		return this;
	}

	public async setServerUpdate(packet: GatewayVoiceServerUpdateDispatch) {
		this.voiceServer = packet.d;
		if (!this.voiceState?.session_id) return;

		await this.node.ws.send({
			op: WebsocketOpEnum.VOICE_UPDATE,
			guildId: this.voiceServer.guild_id,
			sessionId: this.voiceState.session_id,
			event: this.voiceServer
		});
	}

	public setStateUpdate(packet: GatewayVoiceStateUpdateDispatch) {
		this.voiceState = packet.d;
	}

	public async playTrack(track: KirishimaTrack | string, options?: { noReplace?: boolean; pause?: boolean; startTime?: number; endTime?: number }) {
		await this.node.ws.send({
			op: WebsocketOpEnum.PLAY,
			track: track instanceof KirishimaTrack ? track.track : track,
			guildId: this.options.guildId,
			noReplace: true,
			...options
		});
		return this;
	}

	public async setVolume(volume: number) {
		if (volume < 10 || volume > 500) throw new Error('Volume must be between 10 and 500');
		this.filters.volume = volume / 100;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
	}

	public async setTimescale(payload: TimeScaleEqualizer) {
		this.filters.timescale = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setEqualizer(payload: Equalizer[]) {
		this.filters.equalizer = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setKaraoke(payload: KaraokeEqualizer) {
		this.filters.karaoke = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setTremolo(payload: TremoloEqualizer) {
		this.filters.tremolo = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setVibrato(payload: VibratoEqualizer) {
		this.filters.vibrato = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setRotation(payload: RotationEqualizer) {
		this.filters.rotation = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setDistortion(payload: DistortionEqualizer) {
		this.filters.distortion = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setChannelMix(payload: ChannelMixEqualizer) {
		this.filters.channelMix = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setLowPass(payload: LowPassEqualizer) {
		this.filters.lowPass = payload;
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
		return this;
	}

	public async setGroupedFilters(payload: KirishimaFilterOptions) {
		this.filters = new KirishimaFilter(payload);
		await this.node.ws.send({
			op: WebsocketOpEnum.FILTERS,
			guildId: this.options.guildId,
			...this.filters
		});
	}
}
