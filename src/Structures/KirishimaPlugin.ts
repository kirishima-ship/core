import { Awaitable } from '@sapphire/utilities';
import { Kirishima } from './Kirishima';

export abstract class KirishimaPlugin {
	public constructor(public options: { name: string }) {}
	public abstract load(kirishima: Kirishima): Awaitable<unknown>;
}
