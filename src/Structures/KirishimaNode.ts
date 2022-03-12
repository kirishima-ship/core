import { WebSocket } from 'ws';
import { Gateway } from '@kirishima/ws';
import { REST } from '@kirishima/rest';
import type { KirishimaNodeOptions } from '../typings';
import type { Kirishima } from './Kirishima';
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from 'discord-api-types/gateway/v9';
export class KirishimaNode {
	public ws!: Gateway;
	public rest!: REST;
	public constructor(public options: KirishimaNodeOptions, public kirishima: Kirishima) {}

	public get connected() {
		if (!this.ws) return false;
		return this.ws.connection?.readyState === WebSocket.OPEN;
	}

	public async connect(): Promise<KirishimaNode> {
		this.rest ??= new REST(`${this.options.url.endsWith('443') ? 'https' : this.options.secure ? 'https' : 'http'}://${this.options.url}`, {
			Authorization: (this.options.password ??= 'youshallnotpass')
		});
		if (this.connected) return this;
		this.ws = new Gateway(`${this.options.url.endsWith('443') ? 'wss' : this.options.secure ? 'wss' : 'ws'}://${this.options.url}`, {
			Authorization: (this.options.password ??= 'youshallnotpass'),
			'User-Id': this.kirishima.options.clientId!,
			'Client-Name': (this.kirishima.options.clientName ??= `Kirishima NodeJS Lavalink Client (https://github.com/kirishima-ship/core)`)
		});
		await this.ws.connect();
		this.ws.on('open', this.open.bind(this));
		this.ws.on('message', this.message.bind(this));
		this.ws.on('error', this.error.bind(this));
		return this;
	}

	public open(gateway: Gateway) {
		this.kirishima.emit('nodeConnect', this, gateway);
	}

	public error(gateway: Gateway, error: Error) {
		this.kirishima.emit('nodeError', this, gateway, error);
	}

	public message(gateway: Gateway, raw: string) {
		this.kirishima.emit('nodeRaw', this, gateway, raw);
	}

	public toJSON() {
		return {
			identifier: this.options.identifier,
			url: this.options.url,
			secure: this.options.secure,
			password: this.options.password
		};
	}

	public async handleVoiceServerUpdate(packet: GatewayVoiceServerUpdateDispatch) {
		const player = await this.kirishima.options.fetchPlayer!(packet.d.guild_id);
		if (player) {
			await player.setServerUpdate(packet);
		}
	}

	public async handleVoiceStateUpdate(packet: GatewayVoiceStateUpdateDispatch) {
		const player = await this.kirishima.options.fetchPlayer!(packet.d.guild_id!);
		if (player) {
			player.setStateUpdate(packet);
		}
	}
}
