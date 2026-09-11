# System Architecture Design

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │   Web Frontend   │  │  Mobile App      │  │   Admin Portal   │
│  │   (React/Vue)    │  │   (React Native) │  │   (Dashboard)    │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
└───────────┼─────────────────────┼──────────────────────┼──────────┘
            │                     │                      │
            └─────────────────────┼──────────────────────┘
                                  │ (REST API / GraphQL)
┌─────────────────────────────────┼──────────────────────────────────┐
│                    API GATEWAY LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│  • Authentication (JWT/Session)                                  │
│  • Rate Limiting & Load Balancing                               │
│  • Request Validation & Logging                                 │
│  • Error Handling & Response Formatting                         │
└──────────────────────────────────────────────────────────────────┘
            │
┌───────────┼──────────────────────────────────────────────────────┐
│           │           APPLICATION LAYER                          │
├───────────┼──────────────────────────────────────────────────────┤
│  ┌────────▼──────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ User Service      │  │ Movie Service │  │ Inventory Service │ │
│  └───────────────────┘  └──────────────┘  └───────────────────┘ │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Rental Service   │  │ Sales Service │  │ Finance Service   │  │
│  └──────────────────┘  └──────────────┘  └───────────────────┘  │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Customer Service │  │ Report Service│  │ Notification Svc  │  │
│  └──────────────────┘  └──────────────┘  └───────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
            │
┌───────────┼──────────────────────────────────────────────────────┐
│           │         DATA ACCESS LAYER (Repository Pattern)       │
├───────────┼──────────────────────────────────────────────────────┤
│  ┌────────▼──────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ UserRepository    │  │ MovieRepository  │ InventoryRepository
│  └───────────────────┘  └──────────────┘  └───────────────────┘ │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ RentalRepository │  │ SalesRepository  │ ExpenseRepository  │  │
│  └──────────────────┘  └──────────────┘  └───────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
            │
┌───────────┼──────────────────────────────────────────────────────┐
│           │              DATABASE LAYER                          │
├───────────┼──────────────────────────────────────────────────────┤
│  ┌────────▼──────────────────────────────────────────────────┐  │
│  │ MySQL Database (Primary)                                 │  │
│  │ ├─ Tables: Users, Movies, Rentals, Sales, Expenses, etc. │  │
│  │ └─ Views: v_today_sales, v_slow_moving_movies, etc.      │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Redis Cache (Sessions, Frequently Accessed Data)        │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
            │
┌───────────┼──────────────────────────────────────────────────────┐
│           │        EXTERNAL INTEGRATIONS                         │
├───────────┼──────────────────────────────────────────────────────┤
│  ┌────────▼──────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Payment Gateway   │  │ SMS Service  │  │ Email Service     │  │
│  │ (M-Pesa, etc.)    │  │ (Twilio)     │  │ (SendGrid)        │  │
│  └───────────────────┘  └──────────────┘  └───────────────────┘  │
│  ┌──────────────────┐  ┌──────────────┐                          │
│  │ File Storage     │  │ Analytics    │                          │
│  │ (AWS S3/GCS)     │  │ (Google)     │                          │
│  └──────────────────┘  └──────────────┘                          │
└───────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Web**: React 18 + TypeScript + Vite
- **Mobile**: React Native / Flutter
- **UI Framework**: Material-UI or Tailwind CSS
- **State Management**: Redux Toolkit / Zustand
- **API Client**: Axios / React Query

### Backend
- **Runtime**: Node.js (Express) or Python (Flask/Django)
- **Language**: TypeScript or Python 3.10+
- **API**: RESTful with OpenAPI/Swagger documentation
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi/Yup (JS) or Pydantic (Python)

### Database
- **Primary**: MySQL 8.0+
- **Caching**: Redis 7.0+
- **Migrations**: Flyway or Alembic
- **ORM**: Sequelize (Node) or SQLAlchemy (Python)

### DevOps & Infrastructure
- **Version Control**: Git/GitHub
- **CI/CD**: GitHub Actions or Jenkins
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional for scaling)
- **Cloud Platform**: AWS / Google Cloud / DigitalOcean

### External Services
- **Payment**: M-Pesa, Airtel Money APIs
- **Notifications**: Twilio (SMS), SendGrid (Email)
- **File Storage**: AWS S3 or Google Cloud Storage
- **Monitoring**: ELK Stack or DataDog

---

## Service Architecture Details

### 1. **User Service**
**Responsibilities**:
- User registration & authentication
- Role-based access control (RBAC)
- Profile management
- Password reset & security

**Key Methods**:
```
- registerUser(username, email, password, role)
- authenticateUser(username, password) → JWT
- updateUserProfile(userId, data)
- changePassword(userId, oldPassword, newPassword)
- assignRole(userId, role)
- deactivateUser(userId)
```

### 2. **Movie Service**
**Responsibilities**:
- Movie CRUD operations
- Category & language management
- Movie search & filtering
- Pricing management

**Key Methods**:
```
- addMovie(title, category, language, prices)
- updateMovie(movieId, data)
- searchMovies(query, filters)
- getMovieDetails(movieId)
- getMoviesByCategory(categoryId)
- getMoviesByLanguage(languageId)
```

### 3. **Inventory Service**
**Responsibilities**:
- Stock level management
- Availability checking
- Damage tracking
- Low-stock alerts

**Key Methods**:
```
- checkAvailability(movieId) → available_copies
- updateInventory(movieId, action, quantity)
- reportDamage(movieId, damageReport)
- getSlowMovingMovies()
- getMostPopularMovies()
- generateLowStockAlerts()
```

### 4. **Rental Service**
**Responsibilities**:
- Rental transaction processing
- Due date tracking
- Late fee calculation
- Return management

**Key Methods**:
```
- createRental(movieId, customerId, duration)
- processReturn(rentalId, returnDate)
- calculateLateFee(rentalId)
- getOverdueRentals()
- getRentalHistory(customerId)
- updateRentalStatus(rentalId, status)
```

### 5. **Sales Service**
**Responsibilities**:
- Point of Sale operations
- Sales transaction recording
- Translated vs. non-translated tracking
- Sales analytics

**Key Methods**:
```
- recordSale(movieId, quantity, customerId, paymentMethod)
- getSalesByDate(startDate, endDate)
- getSalesReport(filters)
- getTopSellingMovies(period)
- calculateDailyRevenue()
```

### 6. **Customer Service**
**Responsibilities**:
- Customer profile management
- Preference tracking
- Loyalty metrics
- Purchase history

**Key Methods**:
```
- createCustomerProfile(phone, preferences)
- updateCustomerPreferences(customerId, genres, languages)
- getCustomerHistory(customerId)
- getMostLoyalCustomers()
- trackCustomerPreference(customerId, movieId, type)
```

### 7. **Finance Service**
**Responsibilities**:
- Expense tracking & approval
- Income/expense reconciliation
- Profit calculations
- Financial reporting

**Key Methods**:
```
- recordExpense(category, amount, description)
- approveExpense(expenseId)
- calculateTotalIncome(period)
- calculateTotalExpenses(period)
- calculateProfit(period)
- generateFinancialReport(startDate, endDate)
```

### 8. **Report Service**
**Responsibilities**:
- Dashboard data aggregation
- Report generation (PDF/CSV)
- Analytics queries
- Performance metrics

**Key Methods**:
```
- getDashboardMetrics(period)
- generateSalesReport(period, format)
- generateInventoryReport()
- generateFinancialReport(period)
- generateEmployeePerformance(period)
- exportReport(format, fileName)
```

### 9. **Notification Service**
**Responsibilities**:
- SMS alerts (Twilio)
- Email notifications
- In-app notifications
- Alert scheduling

**Key Methods**:
```
- sendOverdueReminder(customerId)
- sendLowStockAlert(movieId)
- sendSalesReceipt(saleId, phone/email)
- sendExpenseApprovalNotification(expenseId)
- broadcastNotification(message, audience)
```

---

## API Endpoints (RESTful)

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/change-password
```

### Movies
```
GET    /api/v1/movies
GET    /api/v1/movies/:id
POST   /api/v1/movies (Admin only)
PUT    /api/v1/movies/:id (Admin only)
DELETE /api/v1/movies/:id (Admin only)
GET    /api/v1/movies/search?query=...
GET    /api/v1/categories
GET    /api/v1/languages
```

### Inventory
```
GET    /api/v1/inventory/:movieId
PUT    /api/v1/inventory/:movieId
GET    /api/v1/inventory/slow-moving
GET    /api/v1/inventory/most-popular
POST   /api/v1/damage-reports
```

### Rentals
```
POST   /api/v1/rentals (create rental)
PUT    /api/v1/rentals/:id/return (process return)
GET    /api/v1/rentals/:id
GET    /api/v1/rentals?customer=...
GET    /api/v1/rentals/overdue
```

### Sales
```
POST   /api/v1/sales (record sale)
GET    /api/v1/sales?startDate=...&endDate=...
GET    /api/v1/sales/reports
GET    /api/v1/sales/top-selling
```

### Customers
```
POST   /api/v1/customers
GET    /api/v1/customers/:id
PUT    /api/v1/customers/:id
GET    /api/v1/customers/:id/history
POST   /api/v1/customers/:id/preferences
```

### Finances
```
POST   /api/v1/expenses (record expense)
PUT    /api/v1/expenses/:id/approve (Owner only)
GET    /api/v1/expenses?status=...
GET    /api/v1/reports/financial?period=...
```

### Reports & Dashboard
```
GET    /api/v1/dashboard/metrics?period=...
GET    /api/v1/reports/sales?format=...
GET    /api/v1/reports/inventory
GET    /api/v1/reports/employees?period=...
GET    /api/v1/reports/profit?period=...
```

---

## Data Flow Examples

### Rental Process Flow
```
Customer Request → Inventory Check → Create Rental Record
    ↓                ↓                    ↓
Available?      Update Inventory    Record Transaction
    ↓                ↓                    ↓
YES ↓         Decrement available_copies
Process Payment → Send Confirmation → Update Dashboard
```

### Sales Process Flow
```
Item Selection → Calculate Total → Process Payment → Record Sale
    ↓               ↓                  ↓                ↓
Get Price      Apply Discounts    (Cash/Mobile)    Update Inventory
    ↓               ↓                  ↓                ↓
            Handle Translated   Verify Payment    Generate Receipt
                   Copy              ↓
                                  Log Transaction
```

### Expense Approval Flow
```
Employee Submits → Admin Review → Approve/Reject → Update Budget
    ↓                ↓                 ↓              ↓
Store Data    Send Notification    Update Status   Audit Log
```

---

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with 15-min access + 7-day refresh
- **RBAC**: Role-based access control via middleware
- **Password**: Bcrypt hashing (salt rounds: 10)
- **HTTPS Only**: All API traffic encrypted

### Data Protection
- **Encryption**: Sensitive data (phone, payment refs) encrypted at rest
- **PII Masking**: Partial phone number display in logs
- **Audit Logging**: All modifications tracked in audit_log table
- **Input Validation**: Strict schema validation on all inputs

### API Security
- **Rate Limiting**: 100 requests/minute per IP
- **CORS**: Restricted to approved origins
- **CSRF**: Token-based CSRF protection
- **SQL Injection Prevention**: Parameterized queries via ORM

---

## Scalability Considerations

### Database
- Horizontal: Replication (master-slave) for read-heavy operations
- Vertical: Index optimization, connection pooling
- Archival: Move old transactions to archive table annually

### Caching
- **Session Cache**: Redis for JWT validation
- **Data Cache**: Cache frequently accessed movies, categories
- **Report Cache**: Cache dashboard metrics (5-min TTL)

### Load Balancing
- **API Server**: Round-robin across multiple instances
- **Database Queries**: Read replicas for reporting

### Monitoring
- **Metrics**: Request count, response time, error rate
- **Alerts**: CPU >80%, Memory >90%, DB connection pool exhausted
- **Logging**: Centralized logging (ELK stack)

---

## Deployment Strategy

### Development
```
git → GitHub → GitHub Actions → Docker Build → Dev Environment
```

### Staging
```
Pull Request → Automated Tests → Staging Deployment → QA Testing
```

### Production
```
Merge to Main → Run Tests → Build Image → Deploy to Production
         ↓
    Blue-Green Deployment (zero downtime)
    ↓
    Health Checks → Traffic Gradual Shift
```

---

## Next Steps

1. Choose specific technology stack (Node/Python for backend)
2. Set up project structure & development environment
3. Implement database migrations
4. Create authentication & authorization system
5. Build core services (Movies, Inventory, Rentals, Sales)
6. Develop API endpoints
7. Create frontend components
