import { Kirishima } from './Kirishima';
import type { KirishimaPlayerOptions } from '../typings/index';
import type { KirishimaNode } from '../index';

export class KirishimaPlayer {
	public constructor(public options: KirishimaPlayerOptions, public kirishima: Kirishima, public node: KirishimaNode) {}

	public async connect(): Promise<KirishimaPlayer> {
		return new Promise(async (resolve) => {
			await this.kirishima.options.send(this.options.guildId, Kirishima.createVoiceChannelPayload(this.options));
			return resolve(this);
		});
	}

	public async disconnect(): Promise<KirishimaPlayer> {
		return new Promise(async (resolve) => {
			await this.kirishima.options.send(this.options.guildId, Kirishima.createVoiceChannelPayload(this.options, true));
			return resolve(this);
		});
	}
}
