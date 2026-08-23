# ☁️ SaaS Multitenancy

> Isolated company workspaces, member invites and roles, Stripe subscriptions and usage metrics, painted in the ividi.dev palette (black, burnt orange, amber).

[🐞 Report Bug](https://github.com/VidiPT89/SaaSMultitenancy/issues) · [✨ Request Feature](https://github.com/VidiPT89/SaaSMultitenancy/issues)

FIRMA is a Next.js tenancy desk: each company is a walled workspace. Admins invite members with admin or member roles, the free plan holds three seats, and Stripe subscriptions (or a local upgrade when keys are empty) lift the wall. Billing webhooks write an event log. Usage bars track jobs and invites. The UI is European Portuguese / English, with the language toggle remembered in `localStorage`. Clerk takes over identity when publishable and secret keys are set; otherwise the seed identities sign in locally.

## ✨ Main Features

- 🏢 **Isolated workspaces** — members only see companies they belong to
- 📨 **Invites and roles** — admin or member, accepted with a token
- 💳 **Free and paid** — Stripe Checkout subscriptions when keys exist
- 🪝 **Billing webhooks** — checkout, invoice and subscription events
- 📊 **Usage metrics** — jobs, invites and seat count
- 🌍 **PT / EN toggle** — remembered in `localStorage`
- 🎬 **Motion** — grain, ember glow and rising usage bars

## 🛠️ Technologies

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-subscriptions-635BFF?style=flat&logo=stripe&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-optional-6C47FF?style=flat&logo=clerk&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **App** | Next.js App Router | Pages and API routes |
| **Data** | Prisma + PostgreSQL | Users, workspaces, memberships, usage |
| **Auth** | Clerk or demo cookie | Identity |
| **Billing** | Stripe Subscriptions | Paid plan and webhooks |
| **Motion** | Framer Motion | Desk reveal and bars |

## 🧱 Project Structure

```text
SaaSMultitenancy/
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/                # routes and API
│   ├── components/
│   │   ├── app/
│   │   ├── home/
│   │   └── layout/
│   ├── i18n/
│   └── lib/
├── tests/
├── LICENSE
└── README.md
```

## ▶️ How to Run

### Prerequisites

- **Node.js** 18+
- **Docker** (PostgreSQL 16 on port 55435)

### Installation

```bash
git clone https://github.com/VidiPT89/SaaSMultitenancy.git
cd SaaSMultitenancy
cp .env.example .env
docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Clerk is optional. Leave those keys empty to sign in as a seeded identity. Stripe is optional. Leave the secret key empty to complete upgrades on this machine. To take real subscriptions, fill `STRIPE_*`, create a recurring Price, and point the webhook to `/api/webhooks/stripe`.

## 📖 Usage

1. Toggle **PT** or **EN** in the header.
2. Open the desk and pick an identity (David sees iVidi.dev, Ana sees both companies).
3. Create a company or open an existing wall.
4. Admins invite members. The free plan stops at three seats.
5. Record usage and watch the bars. Upgrade to paid locally or through Stripe.
6. Accept a pending invite with the token `atelier-guest` while signed in as Convidado.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / POST / DELETE | `/api/session` | Current identity and demo sign-in |
| POST | `/api/workspaces` | Create a company workspace |
| GET | `/api/workspaces/:slug` | Isolated workspace payload |
| POST | `/api/workspaces/:slug/invite` | Invite a member |
| POST | `/api/workspaces/:slug/usage` | Record a usage job |
| POST | `/api/workspaces/:slug/billing` | Start Stripe checkout or local upgrade |
| POST | `/api/invites/accept` | Accept an invite token |
| POST | `/api/webhooks/stripe` | Billing webhooks |

## 🧪 Testing

```bash
npm test
```

`node:test` checks the free-plan seat wall and company slugs.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Developed by **David Arsénio Martins**  
🌐 [ividi.dev](https://ividi.dev/) · 💻 [github.com/VidiPT89](https://github.com/VidiPT89/)
