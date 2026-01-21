-- Add custom bot fields to User for per-user persistence
ALTER TABLE "User"
ADD COLUMN "customBotName" TEXT;
ALTER TABLE "User"
ADD COLUMN "customBotPersona" TEXT;
ALTER TABLE "User"
ADD COLUMN "customBotKnowledge" TEXT;