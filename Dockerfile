# --- ÉTAPE 1 : Dépendances ---
# Utilisation de Node 20 pour satisfaire les exigences de Next.js
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- ÉTAPE 2 : Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
#COPY tsconfig.json ./
COPY . .
# Correction du format ENV (key=value) et désactivation télémétrie
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- ÉTAPE 3 : Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]