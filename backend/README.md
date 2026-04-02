ALERA Backend - FastAPI

A production-grade healthcare API built with FastAPI, PostgreSQL, and Redis.

## Features

- User authentication (JWT tokens)
- Role-based access control (Patient, Provider, Pharmacist, Admin)
- Appointment management
- Prescription management
- Allergy tracking
- Medical history
- Notifications system
- Audit logging for HIPAA compliance
- WebRTC support for telemedicine

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Create database:
```bash
# Make sure PostgreSQL is running
python -c "from database import init_db; init_db()"
```

5. Run development server:
```bash
uvicorn main:app --reload
```

API docs available at: http://localhost:8000/api/docs

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `SENDGRID_API_KEY` - For email notifications
- `TWILIO_ACCOUNT_SID` - For SMS notifications
- `CORS_ORIGINS` - Allowed frontend URLs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `GET /api/users/{user_id}` - Get user by ID
- `GET /api/users/` - List all users (admin only)

### Appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/` - List user appointments
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment

### Prescriptions
- `POST /api/prescriptions/` - Create prescription
- `GET /api/prescriptions/` - List prescriptions
- `GET /api/prescriptions/{id}` - Get prescription details
- `PUT /api/prescriptions/{id}` - Update prescription

### Allergies
- `POST /api/allergies/` - Create allergy record
- `GET /api/allergies/` - List allergies
- `GET /api/allergies/{patient_id}` - Get patient allergies
- `PUT /api/allergies/{id}` - Update allergy
- `DELETE /api/allergies/{id}` - Delete allergy

## Database Schema

Models:
- **User** - Authentication and profile
- **Appointment** - Patient-provider appointments
- **Prescription** - Medication prescriptions
- **Allergy** - Patient allergies
- **MedicalHistory** - Patient medical conditions
- **Notification** - User notifications
- **AuditLog** - HIPAA compliance logs

## Security

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- CORS protection
- SQL injection prevention
- Input validation
- Audit logging

## Deployment

### Vercel Functions (Serverless)
```bash
# Configure vercel.json
# Deploy to Vercel
vercel --prod
```

### Traditional Deployment
```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

## Testing

```bash
pytest
```

## Contributing

1. Create feature branch
2. Add tests
3. Submit pull request

## License

Proprietary - ALERA Healthcare
