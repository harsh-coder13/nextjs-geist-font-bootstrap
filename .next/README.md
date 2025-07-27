# 🍜 StreetFoodConnect

**Connecting Street Food Vendors with Opportunities**

A comprehensive web platform designed to help street food vendors register online and connect with NGOs, event organizers, and food enthusiasts. Built for national-level hackathon presentation.

## 🎯 Project Overview

StreetFoodConnect bridges the gap between authentic street food culture and modern opportunities by providing:

- **For Street Vendors**: Easy online registration, profile management, and exposure to potential partners
- **For NGOs & Organizations**: Access to verified street vendors with filtering capabilities
- **For Event Organizers**: Streamlined vendor discovery and booking process

## 🚀 Features

### Core Functionality
- ✅ **Vendor Registration**: Comprehensive form with hygiene scoring, location, and contact details
- ✅ **Vendor Directory**: Searchable and filterable vendor listings
- ✅ **User Authentication**: Firebase-powered login/signup system
- ✅ **Dashboard**: Vendor profile management with CRUD operations
- ✅ **Contact System**: Inquiry management between vendors and organizations
- ✅ **Multi-language Support**: Google Translate integration (English, Hindi, Marathi, etc.)

### Technical Features
- ✅ **Responsive Design**: Mobile-first approach with Bootstrap 5
- ✅ **Real-time Database**: Firebase Realtime Database integration
- ✅ **Form Validation**: Client-side and server-side validation
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Loading States**: User-friendly loading indicators
- ✅ **Auto-save**: Draft saving for forms
- ✅ **Accessibility**: WCAG compliant design

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables
- **Bootstrap 5**: Responsive framework
- **JavaScript (ES6+)**: Modern vanilla JavaScript
- **Google Fonts**: Poppins font family

### Backend & Services
- **Firebase Authentication**: User management
- **Firebase Realtime Database**: Data storage
- **Google Translate API**: Multi-language support

### Development Tools
- **Git**: Version control
- **VS Code**: Development environment
- **Chrome DevTools**: Testing and debugging

## 📁 Project Structure

```
StreetFoodConnect/
├── index.html              # Landing page
├── register.html           # Vendor registration
├── vendor-list.html        # Vendor directory
├── login.html             # Authentication
├── dashboard.html         # User dashboard
├── contact.html           # Contact form
├── README.md              # Project documentation
├── css/
│   └── styles.css         # Custom styles
├── js/
│   ├── firebase-config.js # Firebase configuration
│   ├── firebase-init.js   # Firebase initialization
│   ├── index.js          # Homepage functionality
│   ├── register.js       # Registration logic
│   ├── vendor-list.js    # Vendor listing logic
│   ├── login.js          # Authentication logic
│   ├── dashboard.js      # Dashboard functionality
│   └── contact.js        # Contact form logic
└── assets/
    └── images/           # Static images (optional)
```

## 🔧 Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account
- Text editor or IDE

### Firebase Setup

1. **Create Firebase Project**
   ```
   1. Go to https://console.firebase.google.com/
   2. Click "Create a project"
   3. Enter project name: "streetfoodconnect" (or your choice)
   4. Enable Google Analytics (optional)
   5. Create project
   ```

2. **Enable Authentication**
   ```
   1. In Firebase Console, go to "Authentication"
   2. Click "Get started"
   3. Go to "Sign-in method" tab
   4. Enable "Email/Password"
   5. Save changes
   ```

3. **Setup Realtime Database**
   ```
   1. In Firebase Console, go to "Realtime Database"
   2. Click "Create Database"
   3. Choose location (closest to your users)
   4. Start in "Test mode" for development
   5. Update rules for production:
   ```

   **Database Rules (for development):**
   ```json
   {
     "rules": {
       "vendors": {
         ".read": true,
         ".write": true
       },
       "contacts": {
         ".read": true,
         ".write": true
       },
       "inquiries": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

4. **Get Firebase Configuration**
   ```
   1. Go to Project Settings (gear icon)
   2. Scroll to "Your apps" section
   3. Click "Add app" → Web (</>) 
   4. Register app with nickname
   5. Copy the configuration object
   ```

### Project Setup

1. **Clone/Download Project**
   ```bash
   # If using Git
   git clone <repository-url>
   cd StreetFoodConnect
   
   # Or download and extract ZIP file
   ```

2. **Configure Firebase**
   ```javascript
   // Edit js/firebase-config.js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **Run the Project**
   ```bash
   # Option 1: Simple HTTP Server (Python)
   python -m http.server 8000
   
   # Option 2: Node.js HTTP Server
   npx http-server -p 8000
   
   # Option 3: VS Code Live Server Extension
   # Right-click index.html → "Open with Live Server"
   ```

4. **Access the Application**
   ```
   Open browser and navigate to:
   http://localhost:8000
   ```

## 🎮 Usage Guide

### For Street Food Vendors

1. **Registration**
   - Visit the homepage
   - Click "Register as Vendor"
   - Fill out the registration form
   - Submit and get listed in the directory

2. **Account Management**
   - Create account via "Login" → "Create New Account"
   - Access dashboard to manage vendor profiles
   - Edit/update vendor information
   - View inquiries from potential partners

### For NGOs & Event Organizers

1. **Finding Vendors**
   - Visit "Find Vendors" page
   - Use filters (city, cuisine, hygiene score)
   - Search by keywords
   - Contact vendors directly

2. **Partnership Inquiries**
   - Click "Contact" on vendor cards
   - Fill inquiry form with event details
   - Vendors receive notifications
   - Direct communication established

## 🗄️ Database Structure

### Vendors Collection (`/vendors`)
```json
{
  "vendor_id": {
    "name": "Vendor Name",
    "cuisine": "North Indian",
    "hygieneScore": 8,
    "location": "Mumbai, Maharashtra",
    "contactPhone": "+91 9876543210",
    "contactEmail": "vendor@example.com",
    "description": "Specialty description",
    "operatingHours": "6:00 AM - 10:00 PM",
    "priceRange": "₹50-100",
    "imageUrl": "image_data_or_url",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "userId": "firebase_user_id",
    "status": "active"
  }
}
```

### Contacts Collection (`/contacts`)
```json
{
  "contact_id": {
    "name": "Contact Name",
    "email": "contact@example.com",
    "phone": "+91 9876543210",
    "subject": "General Inquiry",
    "organization": "Organization Name",
    "message": "Message content",
    "newsletter": true,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "status": "new",
    "userId": "firebase_user_id"
  }
}
```

### Inquiries Collection (`/inquiries`)
```json
{
  "inquiry_id": {
    "vendorId": "vendor_id",
    "vendorName": "Vendor Name",
    "inquirerName": "Inquirer Name",
    "inquirerEmail": "inquirer@example.com",
    "message": "Inquiry message",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "status": "new"
  }
}
```

## 🎨 Design Features

### Color Scheme
- **Primary**: #0d6efd (Bootstrap Blue)
- **Success**: #198754 (Green)
- **Warning**: #ffc107 (Yellow)
- **Danger**: #dc3545 (Red)
- **Info**: #0dcaf0 (Cyan)

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300, 400, 600, 700

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Real-time validation, loading states
- **Navigation**: Sticky header, responsive collapse

## 🔒 Security Considerations

### Current Implementation (Development)
- Open database rules for testing
- Client-side validation only
- Basic authentication

### Production Recommendations
```json
// Secure Database Rules
{
  "rules": {
    "vendors": {
      ".read": true,
      ".write": "auth != null",
      "$vendorId": {
        ".write": "auth.uid == data.child('userId').val()"
      }
    },
    "contacts": {
      ".read": "auth != null",
      ".write": true
    },
    "inquiries": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```

### Additional Security Measures
- Input sanitization
- Rate limiting
- HTTPS enforcement
- Content Security Policy (CSP)
- Regular security audits

## 📱 Mobile Responsiveness

- **Breakpoints**: Bootstrap 5 responsive grid
- **Navigation**: Collapsible mobile menu
- **Forms**: Touch-friendly inputs
- **Cards**: Stacked layout on mobile
- **Images**: Responsive scaling

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## 🚀 Deployment Options

### Static Hosting
- **GitHub Pages**: Free hosting for static sites
- **Netlify**: Continuous deployment from Git
- **Vercel**: Zero-config deployment
- **Firebase Hosting**: Integrated with Firebase services

### Deployment Steps (Firebase Hosting)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Vendor registration flow
- [ ] User authentication (login/signup)
- [ ] Vendor listing and filtering
- [ ] Dashboard CRUD operations
- [ ] Contact form submission
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Test Data
The application includes dummy vendor data for testing:
- Raj's Chaat Corner (Mumbai)
- South Spice Express (Bangalore)
- Delhi Street Delights (Delhi)

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Not Initialized**
   ```
   Error: Firebase database not initialized
   Solution: Check firebase-config.js credentials
   ```

2. **Authentication Errors**
   ```
   Error: User not authenticated
   Solution: Enable Email/Password in Firebase Console
   ```

3. **Database Permission Denied**
   ```
   Error: Permission denied
   Solution: Update database rules in Firebase Console
   ```

4. **Google Translate Not Loading**
   ```
   Error: Translate widget not appearing
   Solution: Check internet connection and script loading
   ```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Style
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Follow semantic HTML practices
- Use meaningful variable names

## 📄 License

This project is created for educational and hackathon purposes. Feel free to use and modify as needed.

## 👥 Team

**StreetFoodConnect Development Team**
- Built for National Hackathon 2024
- Theme: Solving for Street Food

## 📞 Support

For technical support or questions:
- **Email**: support@streetfoodconnect.com
- **Documentation**: This README file
- **Issues**: Create GitHub issue for bugs

## 🎉 Acknowledgments

- **Bootstrap Team**: For the responsive framework
- **Firebase Team**: For backend services
- **Google Fonts**: For typography
- **Street Food Vendors**: For inspiration and real-world insights

---

**Built with ❤️ for the Street Food Community**

*Connecting authentic street food culture with modern opportunities*
