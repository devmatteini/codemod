import type cs from "jscodeshift"

export default function transformer(file: cs.FileInfo, api: cs.API) {
  const j = api.jscodeshift
  const root = j(file.source)

  root.find(j.CallExpression).forEach(call => {
    if (
      call.node.callee.type === "MemberExpression"
      && call.node.callee.property.type === "Identifier"
      && call.node.callee.property.name === "gen"
    ) {
      if (call.node.arguments.length > 0 && call.node.arguments.length <= 2) {
        const arg = call.node.arguments[call.node.arguments.length - 1]
        if (
          arg.type === "FunctionExpression" && arg.generator === true
          && arg.params.length === 1 && arg.params[0].type === "Identifier"
        ) {
          const adapter = arg.params[0].name
          arg.params = []
          j(arg.body).find(j.YieldExpression).forEach(yieldExpr => {
            if (yieldExpr.node.argument?.type === "CallExpression") {
              const call = yieldExpr.node.argument
              if (
                call.callee.type === "Identifier"
                && call.callee.name === adapter
              ) {
                if (
                  call.arguments.length === 1
                  && call.arguments[0].type !== "SpreadElement"
                ) {
                  yieldExpr.node.argument = call.arguments[0]
                } else if (
                  call.arguments.length > 1
                  && call.arguments[0].type !== "SpreadElement"
                ) {
                  const isEffectFunctionImported =
                    root.find(j.ImportDeclaration, {
                      source: { value: "effect/Function" },
                    }).size() > 0

                  if (!isEffectFunctionImported) {
                    root.get().node.program.body.unshift(
                      j.importDeclaration(
                        [j.importNamespaceSpecifier(j.identifier("F"))],
                        j.literal("effect/Function"),
                      ),
                    )
                  }
                  yieldExpr.node.argument = j.callExpression(
                    j.memberExpression(
                      j.identifier("F"),
                      j.identifier("pipe"),
                    ),
                    call.arguments,
                  )
                }
              }
            }
          })
        }
      }
    }
  })

  return root.toSource()
}
