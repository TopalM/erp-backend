import { describe, it, expect } from "vitest";

import * as googleDrive from "../../../src/modules/platform/storage/providers/googleDriveStorage.service.js";
import * as oneDrive from "../../../src/modules/platform/storage/providers/oneDriveStorage.service.js";
import * as s3 from "../../../src/modules/platform/storage/providers/s3Storage.service.js";
import * as minio from "../../../src/modules/platform/storage/providers/minioStorage.service.js";

const providers = [
  ["googleDrive", googleDrive],
  ["oneDrive", oneDrive],
  ["s3", s3],
  ["minio", minio],
];

describe("not implemented storage providers coverage", () => {
  it.each(providers)("%s throws not implemented", (_, provider) => {
    expect(() => provider.ensureFolder("test")).toThrow();
  });
});
