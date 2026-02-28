
        if (actionsMatch) {
          try {
            actions = JSON.parse(actionsMatch[1]);
          } catch {
            actions = [];
          }
        }

        const cleanText = content.replace(/```actions\n[\s\S]*?\n```/g, "").trim();

        return { text: cleanText, actions };
      }),

    generateApp: publicProcedure
      .input(
        z.object({
          description: z.string(),
          appName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { description, appName } = input;

        const prompt = `You are an expert React Native developer. Generate a complete, production-ready React Native app based on this description:

"${description}"

App name: ${appName}
