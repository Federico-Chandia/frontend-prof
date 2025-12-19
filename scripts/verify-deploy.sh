#!/bin/bash

# Este script verifica si el proyecto está listo para desplegar en Netlify
# Úsalo antes de hacer push a GitHub

set -e

echo "🔍 Iniciando verificaciones pre-despliegue..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd frontend

# 1. Verificar Node.js
echo -e "${BLUE}1️⃣  Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
echo ""

# 2. Verificar npm
echo -e "${BLUE}2️⃣  Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm $NPM_VERSION${NC}"
echo ""

# 3. Verificar dependencias
echo -e "${BLUE}3️⃣  Verificando dependencias...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado, instalando...${NC}"
    npm install
fi
echo -e "${GREEN}✅ Dependencias OK${NC}"
echo ""

# 4. TypeScript check
echo -e "${BLUE}4️⃣  Verificando TypeScript...${NC}"
if npm run type-check 2>&1 | tee /tmp/ts-check.log | grep -q "error"; then
    echo -e "${RED}❌ Errores de TypeScript encontrados${NC}"
    cat /tmp/ts-check.log
    exit 1
fi
echo -e "${GREEN}✅ TypeScript OK${NC}"
echo ""

# 5. Lint check
echo -e "${BLUE}5️⃣  Verificando Linting...${NC}"
if npm run lint 2>&1 | tee /tmp/lint-check.log | grep -q "error"; then
    echo -e "${RED}❌ Errores de Lint encontrados${NC}"
    cat /tmp/lint-check.log
    exit 1
fi
echo -e "${GREEN}✅ Lint OK (posibles warnings ignorados)${NC}"
echo ""

# 6. Build test
echo -e "${BLUE}6️⃣  Probando Build...${NC}"
if npm run build 2>&1 | tee /tmp/build-check.log | grep -q "error"; then
    echo -e "${RED}❌ Build falló${NC}"
    cat /tmp/build-check.log
    exit 1
fi
echo -e "${GREEN}✅ Build completado exitosamente${NC}"
echo ""

# 7. Verificar dist
echo -e "${BLUE}7️⃣  Verificando artefactos...${NC}"
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Carpeta dist no encontrada${NC}"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ index.html no encontrado en dist${NC}"
    exit 1
fi

DIST_SIZE=$(du -sh dist | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l)
echo -e "${GREEN}✅ dist/ creado: $DIST_SIZE ($FILE_COUNT archivos)${NC}"
echo ""

# 8. Verificar archivos de configuración
echo -e "${BLUE}8️⃣  Verificando archivos de configuración...${NC}"
CONFIG_FILES=(
    "netlify.toml"
    ".env.production"
    ".env.development"
    "vite.config.ts"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file NO ENCONTRADO${NC}"
        exit 1
    fi
done
echo ""

# 9. Verificar .env.production
echo -e "${BLUE}9️⃣  Verificando .env.production...${NC}"
if grep -q "VITE_API_URL" .env.production; then
    API_URL=$(grep "VITE_API_URL" .env.production | cut -d'=' -f2)
    echo -e "${GREEN}✅ VITE_API_URL: $API_URL${NC}"
else
    echo -e "${RED}❌ VITE_API_URL no configurada${NC}"
    exit 1
fi

if grep -q "VITE_SOCKET_URL" .env.production; then
    SOCKET_URL=$(grep "VITE_SOCKET_URL" .env.production | cut -d'=' -f2)
    echo -e "${GREEN}✅ VITE_SOCKET_URL: $SOCKET_URL${NC}"
else
    echo -e "${RED}❌ VITE_SOCKET_URL no configurada${NC}"
    exit 1
fi
echo ""

# 10. Advertencias finales
echo -e "${BLUE}🔟 Verificaciones Finales...${NC}"

# Buscar hardcoded secrets
if grep -r "mongodb+srv://" . --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null | grep -v ".env"; then
    echo -e "${YELLOW}⚠️  Posible MongoDB URI hardcodeada (revisar)${NC}"
fi

if grep -r "sk_live_" . --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null; then
    echo -e "${RED}❌ Stripe key encontrada - MOVER A .env${NC}"
    exit 1
fi

if grep -r "AIza" . --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null | grep -v ".env"; then
    echo -e "${YELLOW}⚠️  Google API key posiblemente hardcodeada (revisar)${NC}"
fi

echo -e "${GREEN}✅ Verificaciones de seguridad completadas${NC}"
echo ""

# Resumen final
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ TODAS LAS VERIFICACIONES PASADAS${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Próximos pasos:${NC}"
echo "1. git add ."
echo "2. git commit -m 'Deploy config for Netlify'"
echo "3. git push origin main"
echo "4. Deploy en Netlify Dashboard"
echo ""
echo -e "${GREEN}🎉 ¡Listo para desplegar!${NC}"
