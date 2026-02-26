# Contributing to LynQ

Thank you for your interest in contributing to LynQ!

## Development Setup

1. **Clone the repository**

```bash
git clone <repo-url>
cd lynq
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development services**

```bash
docker-compose up -d mongodb redis
```

4. **Set up environment**

```bash
cp .env.example .env
# Edit .env with your credentials
```

5. **Run database seed**

```bash
npm run seed
```

6. **Start development server**

```bash
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Write meaningful commit messages

## Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Reporting Bugs

Please use GitHub Issues and include:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Feature Requests

We welcome feature requests! Please open an issue describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternative solutions you've considered
