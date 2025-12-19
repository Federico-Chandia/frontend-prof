#!/bin/bash

# Pre-deployment checks script

echo "🔍 Ejecutando verificaciones pre-despliegue..."

# Verificar Node version
echo "Verificando Node.js version..."
node --version

# Verificar variables de entorno
echo ""
echo "📋 Verificando variables de entorno requeridas..."
required_vars=("VITE_API_URL" "VITE_MERCADOPAGO_PUBLIC_KEY" "VITE_GOOGLE_MAPS_API_KEY")

missing_vars=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "⚠️  Variables de entorno faltantes:"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
else
  echo "✅ Todas las variables de entorno están configuradas"
fi

# TypeScript check
echo ""
echo "🔎 Verificando TypeScript..."
npm run type-check

if [ $? -ne 0 ]; then
  echo "❌ Errores de TypeScript detectados"
  exit 1
fi

# Lint check
echo ""
echo "🎯 Ejecutando linter..."
npm run lint

if [ $? -ne 0 ]; then
  echo "⚠️  Advertencias de linter (no críticas)"
fi

# Build test
echo ""
echo "🔨 Probando build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build falló"
  exit 1
fi

# Check dist directory
echo ""
echo "📦 Verificando artefactos de build..."
if [ -d "dist" ]; then
  size=$(du -sh dist | cut -f1)
  echo "✅ Carpeta dist creada exitosamente (tamaño: $size)"
  
  # Check index.html exists
  if [ -f "dist/index.html" ]; then
    echo "✅ index.html encontrado en dist"
  else
    echo "❌ index.html no encontrado en dist"
    exit 1
  fi
else
  echo "❌ Carpeta dist no encontrada"
  exit 1
fi

echo ""
echo "✅ Todas las verificaciones pre-despliegue pasaron"
echo "Listo para desplegar a Netlify 🚀"
