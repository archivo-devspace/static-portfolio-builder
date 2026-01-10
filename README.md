# Static Portfolio Builder

A professional Next.js application that enables authenticated users to upload and deploy static websites/portfolios via ZIP files. Built with security, scalability, and developer experience in mind.

---

## ✨ Core Features

### 🔐 Authentication & Security

- **Session-based authentication** using Iron Session
- Secure password hashing and validation
- Protected routes and API endpoints

### 📦 File Management

- **ZIP file upload** with validation
- Automated extraction and deployment
- File type and size validation
- Clean file structure organization

### 🎨 User Interface

- **Fully responsive design** (mobile, tablet, desktop)
- Modern, clean Tailwind CSS styling
- Intuitive navigation with mobile hamburger menu

### ⚡ Performance & Architecture

- **Next.js 16+ with App Router**
- Type-safe development with TypeScript
- Optimized build process

---

## 🧱 Technology Stack

### Core Framework

- **Next.js 16+** (App Router architecture)
- **React 19** with Server Components
- **TypeScript** for type safety
- **Node.js** runtime environment

### Authentication & Security

- **Iron Session** for secure session management
- Environment-based secret management
- Input validation and sanitization

### Styling & UI

- **Tailwind CSS** for utility-first styling
- Responsive design principles

### Development Tools

- ESLint for code quality
- Prettier for code formatting
- Path aliases for clean imports

---

## 🏗️ Architecture

### Powered By [Archivo](https://archivodevspace.com)

This project is built on **Archivo**, a comprehensive platform designed specifically for static website deployment and portfolio hosting.

**Archivo provides:**

| Feature                     | Benefit                                                       |
| --------------------------- | ------------------------------------------------------------- |
| **Secure Upload Pipeline**  | End-to-end encrypted file transfer with validation            |
| **Automated Deployment**    | One-click deployment with automatic extraction                |
| **Session Management**      | Robust authentication with secure session handling            |                 |
| **Developer Experience**    | Clean APIs, comprehensive documentation, and easy integration |

Archivo's foundation ensures this builder delivers:

- ✅ Easy maintenance and updates
- ✅ Scalable user management
- ✅ Professional deployment workflows

---

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- Git

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd static-portfolio-builder

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.sample .env.local

# 4. Edit .env.local with your configuration
# Add your session secret and other environment-specific values

# 5. Create storage directory
mkdir -p mock-portfolios-storage

# 6. Create deployment subdirectory (example format: profile.domain => johndoe.archivodevspace.com)
mkdir -p mock-portfolios-storage/[profile].[domain]

# 7. Create data directory for user management
mkdir -p src/data

# 8. Create users.json file with initial credentials
echo '[{"username": "admin", "password": "secure_password"}]' > src/data/users.json
```

---

## 💻 Running the Application

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

---

## 🚀 Deployment Considerations

### Production Checklist

- [ ] Update `SESSION_SECRET` with strong value
- [ ] Configure HTTPS/SSL certificates

### Security Best Practices

- Regularly rotate session secrets
- Implement rate limiting on uploads
- Add file scanning for malware
- Use environment variables for sensitive data

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request to the main repository

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🆘 Support

For issues, questions, or feature requests:

1. Check the documentation
2. Review existing issues
3. Contact the development team
