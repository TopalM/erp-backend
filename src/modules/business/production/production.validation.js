import { z } from "zod";

const id = z.string().min(1);

const numberOptional = z.preprocess((value) => (value === "" || value === undefined ? null : value), z.coerce.number().optional().nullable());

const intOptional = z.preprocess((value) => (value === "" || value === undefined ? null : value), z.coerce.number().int().optional().nullable());

const nullableString = z.preprocess((value) => (value === "" || value === undefined ? null : value), z.string().optional().nullable());

const dateString = z
  .string()
  .min(10)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Geçerli bir tarih giriniz.",
  });

const productFieldsSchema = z.object({
  productId: nullableString,
  productCode: nullableString,
  productName: nullableString,
  product: z.string().min(1),
});

const productionInputSchema = z.object({
  productId: nullableString,
  rawMaterialReceiptItemId: nullableString,
  rawMaterialName: nullableString,
  lotNo: nullableString,
  quantity: z.coerce.number().positive(),
  unitName: nullableString,
  originId: nullableString,
  originName: nullableString,
});

const productionOutputSchema = z.object({
  productId: nullableString,
  lotNo: nullableString,
  quantity: z.coerce.number().positive(),
  unitName: nullableString,
  tankNo: nullableString,
});

export const createOriginSchema = z.object({
  rawMaterialKey: z.string().min(1),
  rawMaterialName: z.string().min(1),
  brandName: z.string().min(1),
});

export const createPlanSchema = z.object({
  year: z.coerce.number().int().min(2020),
  week: z.coerce.number().int().min(1).max(53),

  jobs: z
    .array(
      z
        .object({
          reactorId: id,
          plannedStart: dateString,
          plannedEnd: dateString,
          plannedDurationMinute: z.coerce.number().int().positive(),
          plannedQuantity: numberOptional,
          plannedTwoEH: numberOptional,
          plannedPTA: numberOptional,
          description: nullableString,
        })
        .merge(productFieldsSchema),
    )
    .min(1),

  loadOrder: z.array(id).optional().nullable(),
  maxProductionStart: dateString.optional().nullable(),
  maxProductionEnd: dateString.optional().nullable(),
});

export const updatePlanSchema = z
  .object({
    plannedStart: dateString,
    plannedEnd: dateString,
    plannedDurationMinute: z.coerce.number().int().positive(),
    plannedQuantity: numberOptional,
    plannedTwoEH: numberOptional,
    plannedPTA: numberOptional,
    description: nullableString,
  })
  .merge(productFieldsSchema);

export const finishProductionSchema = z.object({
  formen: z.string().min(1),
  actualStart: dateString,
  actualEnd: dateString,
  actualDurationMinute: z.coerce.number().int().positive(),
  actualQuantity: z.coerce.number(),

  description: nullableString,

  rekuper: numberOptional,

  twoEthylAlcohol: numberOptional,
  totalTwoEthylAlcohol: numberOptional,
  twoEthylAlcoholLotNo: nullableString,

  pta: numberOptional,
  ptaLotNo: nullableString,

  aa: numberOptional,
  aaLotNo: nullableString,

  tma: numberOptional,
  tmaLotNo: nullableString,

  catalyst: numberOptional,
  catalystLotNo: nullableString,

  causticSoda: numberOptional,

  reactionStartTime: nullableString,
  reactionStartTemperature: numberOptional,
  reactionStartCatalystAmount: numberOptional,

  catalyst2Time: nullableString,
  catalyst2Temperature: numberOptional,
  catalyst2Amount: numberOptional,

  catalyst3Time: nullableString,
  catalyst3Temperature: numberOptional,
  catalyst3Amount: numberOptional,

  reactionRows: z
    .array(
      z.object({
        time: nullableString,
        temperature: numberOptional,
        acidIndex: numberOptional,
        consumption: numberOptional,
      }),
    )
    .optional(),

  washingTime: nullableString,
  washingTemperature: numberOptional,

  strippingStartTime: nullableString,
  strippingStartTemperature: numberOptional,

  flashPointTime: nullableString,
  flashPointTemperature: numberOptional,
  flashPointValue: numberOptional,

  hasFinalWashing: z.boolean().optional(),

  finalFlashPointTime: nullableString,
  finalFlashPointTemperature: numberOptional,
  finalFlashPointValue: numberOptional,

  dryingStartTime: nullableString,
  dryingEndTime: nullableString,

  extraAlcohol1: numberOptional,
  extraAlcohol2: numberOptional,
  extraAlcohol3: numberOptional,

  rekuperLitre: numberOptional,
  dropTank: z.union([z.string(), z.number()]).optional().nullable(),
  stockTank: z.union([z.string(), z.number()]).optional().nullable(),

  productionBreakdownMinute: intOptional,
  productionBreakdownDescription: nullableString,

  inputs: z.array(productionInputSchema).optional(),
  outputs: z.array(productionOutputSchema).optional(),
});

export const cancelProductionSchema = z.object({
  description: nullableString,
});

export const delaySchema = z.object({
  year: z.coerce.number().int().min(2020),
  week: z.coerce.number().int().min(1).max(53),
  reactorId: id,
  afterJobId: nullableString,
  delayJobId: nullableString,
  durationMinute: z.coerce.number().int().positive(),
  reason: z.enum(["Arıza / Müdahale", "Bakım", "Operasyonel Bekleme", "Hammadde Bekleme", "Analiz Bekleme", "Temizlik", "Diğer"]),
  description: nullableString,
});

export const addBatchSchema = z
  .object({
    year: z.coerce.number().int().min(2020),
    week: z.coerce.number().int().min(1).max(53),
    reactorId: id,
    plannedStart: dateString,
    plannedEnd: dateString,
    plannedDurationMinute: z.coerce.number().int().positive(),
    plannedQuantity: z.coerce.number(),
    plannedTwoEH: numberOptional,
    plannedPTA: numberOptional,
    description: nullableString,
  })
  .merge(productFieldsSchema);
