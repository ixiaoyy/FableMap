import type { PetSpecies } from "../../../../domain/pets/definitions.ts";
import type { Facing } from "../../../../domain/world/facing.ts";
import { mediaUrl } from "./media-catalog.ts";

const PET_MEDIA_PATH = "assets/vendor/bluecarrot16/lpc-cats-and-dogs-2016";

export const PET_MEDIA_KEYS: Readonly<Record<PetSpecies, string>> = {
  cat: "lpc-home-cat",
  dog: "lpc-home-dog",
};

export const PET_MEDIA_URLS: Readonly<Record<PetSpecies, string>> = {
  cat: mediaUrl(`${PET_MEDIA_PATH}/cat.png`, "914bae85"),
  dog: mediaUrl(`${PET_MEDIA_PATH}/dog.png`, "77f4667a"),
};

export interface PetMediaProfile {
  readonly species: PetSpecies;
  readonly textureKey: string;
  readonly url: string;
  readonly frameWidth: 32;
  readonly frameHeight: 32;
  readonly idle: Readonly<Record<Facing, number>>;
  readonly walk: Readonly<Record<Facing, readonly number[]>>;
  readonly rest: Readonly<Record<"left" | "right", number>>;
  readonly fallbackColor: number;
  readonly fallbackAccent: number;
}

export interface PetAdoptionOption {
  readonly species: PetSpecies;
  readonly label: string;
  readonly note: string;
  readonly preview: {
    readonly url: string;
    readonly sheetWidth: 512;
    readonly sheetHeight: 256;
    readonly x: number;
    readonly y: number;
    readonly width: 32;
    readonly height: 32;
  };
}

const PET_MEDIA_PROFILES: Readonly<Record<PetSpecies, PetMediaProfile>> = {
  cat: {
    species: "cat",
    textureKey: PET_MEDIA_KEYS.cat,
    url: PET_MEDIA_URLS.cat,
    frameWidth: 32,
    frameHeight: 32,
    idle: { right: 5, up: 21, down: 37, left: 53 },
    walk: {
      right: [4, 5, 6, 5],
      up: [20, 21, 22, 21],
      down: [36, 37, 38, 37],
      left: [52, 53, 54, 53],
    },
    rest: { right: 7, left: 55 },
    fallbackColor: 0xd9a45d,
    fallbackAccent: 0x6c472a,
  },
  dog: {
    species: "dog",
    textureKey: PET_MEDIA_KEYS.dog,
    url: PET_MEDIA_URLS.dog,
    frameWidth: 32,
    frameHeight: 32,
    idle: { right: 9, up: 25, down: 41, left: 57 },
    walk: {
      right: [8, 9, 10, 9],
      up: [24, 25, 26, 25],
      down: [40, 41, 42, 41],
      left: [56, 57, 58, 57],
    },
    rest: { right: 11, left: 59 },
    fallbackColor: 0xe2b657,
    fallbackAccent: 0x714a2b,
  },
};

export const PET_ADOPTION_OPTIONS: readonly PetAdoptionOption[] = [
  {
    species: "cat",
    label: "橘猫",
    note: "安静、好奇，喜欢在院角晒太阳",
    preview: {
      url: PET_MEDIA_URLS.cat,
      sheetWidth: 512,
      sheetHeight: 256,
      x: 5 * 32,
      y: 2 * 32,
      width: 32,
      height: 32,
    },
  },
  {
    species: "dog",
    label: "黄犬",
    note: "热情、踏实，总在门边等你回家",
    preview: {
      url: PET_MEDIA_URLS.dog,
      sheetWidth: 512,
      sheetHeight: 256,
      x: 9 * 32,
      y: 2 * 32,
      width: 32,
      height: 32,
    },
  },
];

/** Resolves one adopted species into the only reviewed sprite-frame profile. */
export function petMediaProfile(species: PetSpecies): PetMediaProfile {
  return PET_MEDIA_PROFILES[species];
}
