import {
	ChannelMixEqualizer,
	DistortionEqualizer,
	Equalizer,
	KaraokeEqualizer,
	LowPassEqualizer,
	RotationEqualizer,
	TimeScaleEqualizer,
	TremoloEqualizer,
	VibratoEqualizer
} from 'lavalink-api-types';

export class KirishimaFilter {
	public volume: number | undefined;
	public equalizer: Equalizer[] | undefined;
	public karaoke: KaraokeEqualizer | undefined;
	public timescale: TimeScaleEqualizer | undefined;
	public tremolo: TremoloEqualizer | undefined;
	public vibrato: VibratoEqualizer | undefined;
	public rotation: RotationEqualizer | undefined;
	public distortion: DistortionEqualizer | undefined;
	public channelMix: ChannelMixEqualizer | undefined;
	public lowPass: LowPassEqualizer | undefined;

	public constructor(options?: KirishimaFilterOptions) {
		this.volume = options?.volume ?? 1.0;
		this.equalizer = options?.equalizer ?? undefined;
		this.karaoke = options?.karaoke ?? undefined;
		this.timescale = options?.timescale ?? undefined;
		this.tremolo = options?.tremolo ?? undefined;
		this.vibrato = options?.vibrato ?? undefined;
		this.rotation = options?.rotation ?? undefined;
		this.distortion = options?.distortion ?? undefined;
		this.channelMix = options?.channelMix ?? undefined;
		this.lowPass = options?.lowPass ?? undefined;
	}
}

export interface KirishimaFilterOptions {
	volume: number | undefined;
	equalizer: Equalizer[] | undefined;
	karaoke: KaraokeEqualizer | undefined;
	timescale: TimeScaleEqualizer | undefined;
	tremolo: TremoloEqualizer | undefined;
	vibrato: VibratoEqualizer | undefined;
	rotation: RotationEqualizer | undefined;
	distortion: DistortionEqualizer | undefined;
	channelMix: ChannelMixEqualizer | undefined;
	lowPass: LowPassEqualizer | undefined;
}
