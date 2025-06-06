
# Portfolio Admin Application

A modern, secure portfolio website with comprehensive admin panel built with React, TypeScript, and Supabase.

## 🌟 Features

### Public Portfolio
- **Responsive Design**: Modern, mobile-first design that looks great on all devices
- **Hero Section**: Professional introduction with animated elements
- **About Section**: Personal bio, skills display with progress bars, and social links
- **Projects Showcase**: Display of portfolio projects with detailed information
- **Certificates**: Professional certifications and achievements
- **Contact Form**: Secure contact form with email integration
- **Dark/Light Theme**: Toggle between themes for better user experience

### Admin Panel
- **Secure Authentication**: Email/password login with rate limiting and lockout protection
- **Dashboard**: Overview of portfolio statistics and recent activity
- **Profile Management**: Update personal information, skills, and social links
- **Project Management**: Create, edit, and delete portfolio projects
- **Certificate Management**: Manage professional certifications
- **Message Management**: View and respond to contact form submissions
- **Image Upload**: Secure image upload for profile and project images

### Security Features
- **Rate Limiting**: 5 failed login attempts trigger 10-minute lockout
- **Session Management**: Secure session validation and automatic logout
- **Input Sanitization**: Protection against XSS and injection attacks
- **Admin-Only Access**: Restricted admin panel access to designated email
- **Persistent Security**: Rate limiting persists across page refreshes

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Authentication, Database, Storage)
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Email Service**: EmailJS

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- EmailJS account (for contact form)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key
   - Add your EmailJS service ID, template ID, and public key

4. **Database Setup**
   - Set up Supabase project
   - Run the provided SQL migrations for tables and functions
   - Configure Row Level Security (RLS) policies

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Admin Access
- Update the admin email in `src/services/securityService.ts`
- The designated admin email: `gislainrugira@gmail.com`
- Admin functions are available in Supabase database

### Rate Limiting
- Maximum login attempts: 5
- Lockout duration: 10 minutes
- Attempts are stored in localStorage for persistence

### Email Configuration
- Configure EmailJS for contact form functionality
- Update email templates as needed

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin panel components
│   ├── sections/       # Homepage sections
│   └── ui/            # shadcn/ui components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── pages/              # Page components
├── services/           # Business logic and API calls
├── types/              # TypeScript type definitions
└── lib/               # Utility functions
```

## 🔐 Security Implementation

### Authentication Flow
1. User enters credentials on login page
2. Input validation and sanitization
3. Rate limiting check (localStorage-based)
4. Supabase authentication
5. Admin role verification
6. Session management and token handling

### Rate Limiting Details
- **Storage**: Browser localStorage for persistence
- **Reset Conditions**: Successful login or lockout expiration
- **Bypass Protection**: Cannot be bypassed by page refresh
- **Error Handling**: Graceful degradation with user feedback

### Data Protection
- All inputs are sanitized before processing
- SQL injection protection via Supabase RLS
- XSS protection through input validation
- Secure session management

## 📊 Database Schema

### Key Tables
- `profiles`: User profile information
- `projects`: Portfolio projects
- `certificates`: Professional certifications
- `messages`: Contact form submissions
- `logs`: System activity logs

### Security Functions
- `is_admin()`: Verifies admin access
- `delete_old_messages()`: Automatic message cleanup

## 🚀 Deployment

### Using Lovable (Recommended)
1. Connect your project to GitHub via Lovable
2. Click "Publish" in the Lovable interface
3. Configure custom domain if needed

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables on your hosting platform

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

## 🐛 Troubleshooting

### Common Issues
- **Login fails**: Check Supabase configuration and admin email
- **Rate limiting not working**: Verify localStorage permissions
- **Images not uploading**: Check Supabase storage configuration
- **Contact form issues**: Verify EmailJS configuration

### Security Considerations
- Always use HTTPS in production
- Regularly update dependencies
- Monitor failed login attempts
- Review and update RLS policies

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a portfolio application with admin functionality. Ensure proper security measures are in place before deploying to production.
