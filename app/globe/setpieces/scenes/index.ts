import type { SetPieceId } from "../catalog";
import type { SceneDef } from "../kit";
import dday from "./d-day";
import dunkirk from "./dunkirk";
import hiroshima from "./hiroshima";
import messines from "./messines";
import midway from "./midway";
import nagasaki from "./nagasaki";
import pearlHarbor from "./pearl-harbor";

export const SCENES: Record<SetPieceId, SceneDef> = {
  messines,
  dunkirk,
  "pearl-harbor": pearlHarbor,
  midway,
  "d-day": dday,
  hiroshima,
  nagasaki,
};
