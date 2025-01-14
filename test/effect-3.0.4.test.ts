import { describe } from "vitest"
import transformer from "../public/codemods/effect-3.0.4"
import * as Utils from "./Utils"

const expectTransformation = Utils.expectTransformation(transformer)

describe("Remove adapter", () => {
  expectTransformation(
    `Convert adapter of single operation`,
    `import * as Effect from "effect/Effect"
Effect.gen(function* (_) {
  yield* _(myEffect)
})`,
    `import * as Effect from "effect/Effect"
Effect.gen(function*() {
  yield* myEffect
})`,
  )

  expectTransformation(
    `Convert adapter to F.pipe`,
    `import * as Effect from "effect/Effect"
Effect.gen(function* (_) {
  yield* _(myEffect, Effect.tap(Effect.logInfo))
})`,
    `import * as F from "effect/Function";
import * as Effect from "effect/Effect"
Effect.gen(function*() {
  yield* F.pipe(myEffect, Effect.tap(Effect.logInfo))
})`,
  )

  expectTransformation(
    `Convert adapter to F.pipe when first argument is not pipeable`,
    `import * as Effect from "effect/Effect"
Effect.gen(function* (_) {
  const myArray = [1, 2, 3]
  yield* _(myArray, Effect.forEach(Effect.logInfo))
})`,
    `import * as F from "effect/Function";
import * as Effect from "effect/Effect"
Effect.gen(function*() {
  const myArray = [1, 2, 3]
  yield* F.pipe(myArray, Effect.forEach(Effect.logInfo))
})`,
  )
})
