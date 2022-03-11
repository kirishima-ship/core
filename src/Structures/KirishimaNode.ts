import { WebSocket } from 'ws';
import { Gateway } from '@kirishima/ws';
import { REST } from '@kirishima/rest';
import type { KirishimaNodeOptions } from '../typings';
import type { Kirishima } from './Kirishima';
export class KirishimaNode {
	public ws!: Gateway;
	public rest!: REST;
	public constructor(public options: KirishimaNodeOptions, public kirishima: Kirishima) {}

	public get connected() {
		if (!this.ws) return false;
		return this.ws.connection?.readyState === WebSocket.OPEN;
	}

	public async connect(): Promise<KirishimaNode> {
		return new Promise((resolve) => {
			this.rest ??= new REST(`${this.options.secure ? 'wss' : 'ws'}://${this.options.url}`, {
				Authorization: (this.options.password ??= 'youshallnotpass')
			});
			if (this.connected) return this;
			this.ws = new Gateway(`${this.options.secure ? 'wss' : 'ws'}://${this.options.url}`, {
				Authorization: (this.options.password ??= 'youshallnotpass'),
				'User-Id': this.kirishima.options.clientId!,
				'Client-Name': (this.kirishima.options.clientName ??= `Kirishima NodeJS Lavalink Client (https://github.com/kirishima-ship/core)`)
			});
			this.ws.on('open', this.open.bind(this));
			this.ws.on('message', this.message.bind(this));
			this.ws.on('error', this.error.bind(this));
			return resolve(this);
		});
	}

	public open(gateway: Gateway) {
		this.kirishima.emit('nodeConnect', this, gateway);
	}

	public error(gateway: Gateway) {
		this.kirishima.emit('nodeError', this, gateway);
	}

	public message(gateway: Gateway, raw: string) {
		this.kirishima.emit('nodeRaw', this, gateway, raw);
	}
}