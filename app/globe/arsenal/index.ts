import type { BufferGeometry } from "three";
import { b24, c47, horsa } from "./air";
import { village } from "./buildings";
import { casemate, hedgehog, mgNest } from "./defenses";
import { infantry, panzerIV, paratrooper, sherman, shermanDD } from "./land";
import {
  attackTransport,
  battleship,
  battleshipFiring,
  destroyer,
  lct,
  lcvp,
  lcvpOpen,
} from "./sea";

export interface ArsenalEntry {
  name: string;
  side: "allied" | "axis" | "neutral";
  meters: number;
  build: () => BufferGeometry;
}

export const ARSENAL = {
  c47: { name: "C-47 Skytrain", side: "allied", meters: 19.4, build: c47 },
  horsa: { name: "Airspeed Horsa", side: "allied", meters: 20.4, build: horsa },
  b24: { name: "B-24 Liberator", side: "allied", meters: 20.6, build: b24 },
  "us-battleship": {
    name: "Nevada-class battleship",
    side: "allied",
    meters: 177,
    build: battleship,
  },
  "us-battleship-firing": {
    name: "Nevada-class battleship, guns trained to starboard",
    side: "allied",
    meters: 177,
    build: battleshipFiring,
  },
  "fletcher-destroyer": {
    name: "Fletcher-class destroyer",
    side: "allied",
    meters: 115,
    build: destroyer,
  },
  "attack-transport": {
    name: "Attack transport (APA)",
    side: "allied",
    meters: 150,
    build: attackTransport,
  },
  lcvp: { name: "LCVP Higgins boat", side: "allied", meters: 11, build: lcvp },
  "lcvp-open": {
    name: "LCVP Higgins boat, ramp down",
    side: "allied",
    meters: 11,
    build: lcvpOpen,
  },
  lct: { name: "LCT Mk 5 with tanks", side: "allied", meters: 36, build: lct },
  sherman: { name: "M4 Sherman", side: "allied", meters: 5.8, build: sherman },
  "sherman-dd": {
    name: "M4 Sherman DD, screen raised",
    side: "allied",
    meters: 5.8,
    build: shermanDD,
  },
  infantry: {
    name: "Rifle squad (8)",
    side: "allied",
    meters: 12,
    build: infantry,
  },
  paratrooper: {
    name: "Paratrooper under canopy",
    side: "allied",
    meters: 8,
    build: paratrooper,
  },
  "panzer-iv": {
    name: "Panzer IV Ausf. H",
    side: "axis",
    meters: 7,
    build: panzerIV,
  },
  casemate: {
    name: "Atlantic Wall gun casemate",
    side: "axis",
    meters: 16,
    build: casemate,
  },
  "mg-nest": {
    name: "Tobruk machine-gun nest",
    side: "axis",
    meters: 5,
    build: mgNest,
  },
  hedgehog: {
    name: "Czech hedgehog",
    side: "axis",
    meters: 2,
    build: hedgehog,
  },
  village: {
    name: "Normandy village with church",
    side: "neutral",
    meters: 250,
    build: village,
  },
} satisfies Record<string, ArsenalEntry>;

export type ArsenalId = keyof typeof ARSENAL;
