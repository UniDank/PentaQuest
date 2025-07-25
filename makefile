# Variabili
PNPM=pnpm
DC=docker compose
COMPOSE_FILE=compose.yml

# Installa le dipendenze del progetto
install:
	@echo "📦 Installing project dependencies with pnpm..."
	$(PNPM) install

# Costruisce e avvia i container (DB + backend)
up:
	@echo "🚀 Building and starting Docker containers..."
	$(DC) up -d

# Avvia il dev server (Node/JS)
dev:
	@echo "▶️ Starting development server..."
	$(PNPM) run dev

# Ferma i container
stop:
	@echo "🛑 Stopping Docker containers..."
	$(DC) down

# Avvia tutto: container e dev server
start:
	@echo "🚀 Starting containers and dev server..."
	make up
	make dev

# Cancella il progetto
clean:
	@echo "🧹 Cleaning up project..."
	make stop
	@echo "🧽 Removing node_modules..."
	@rm -rf node_modules 2>nul || rmdir /s /q node_modules || echo "node_modules not found"

.PHONY: install up dev stop start clean