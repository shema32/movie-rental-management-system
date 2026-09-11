# Database Schema Design

## Entity-Relationship Diagram (Conceptual)

```
Users (1) ──────────── (M) Rentals
Users (1) ──────────── (M) Sales
Users (1) ──────────── (M) Expenses
Users (1) ──────────── (M) AuditLog

Movies (1) ──────────── (M) Inventory
Movies (1) ──────────── (M) Rentals
Movies (1) ──────────── (M) Sales
Movies (1) ──────────── (M) CustomerPreferences

Categories (1) ──────────── (M) Movies

Languages (1) ──────────── (M) Movies
Languages (1) ──────────── (M) CustomerPreferences

Rentals (M) ──────────── (1) Customer
Sales (M) ──────────── (1) Customer (optional)

Expenses (1) ──────────── (1) ExpenseCategory
```

---

## Table Definitions

### 1. **Users**
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  role ENUM('OWNER', 'ADMIN', 'EMPLOYEE', 'CUSTOMER') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);
```

### 2. **Categories**
```sql
CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_category_name (category_name)
);
```

### 3. **Languages**
```sql
CREATE TABLE languages (
  language_id INT PRIMARY KEY AUTO_INCREMENT,
  language_name VARCHAR(50) NOT NULL UNIQUE,
  language_code VARCHAR(5) NOT NULL UNIQUE,
  
  INDEX idx_language_name (language_name)
);
```

### 4. **Movies**
```sql
CREATE TABLE movies (
  movie_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  director VARCHAR(100),
  release_year YEAR,
  category_id INT NOT NULL,
  language_id INT NOT NULL,
  rental_price_per_day DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  purchase_cost DECIMAL(10, 2) NOT NULL,
  duration_minutes INT,
  is_translated BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (language_id) REFERENCES languages(language_id),
  INDEX idx_title (title),
  INDEX idx_category (category_id),
  INDEX idx_language (language_id),
  INDEX idx_is_active (is_active)
);
```

### 5. **Inventory**
```sql
CREATE TABLE inventory (
  inventory_id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL UNIQUE,
  total_copies INT NOT NULL DEFAULT 0,
  available_copies INT NOT NULL DEFAULT 0,
  rented_out INT NOT NULL DEFAULT 0,
  damaged_copies INT NOT NULL DEFAULT 0,
  last_stock_check TIMESTAMP,
  
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  CHECK (available_copies + rented_out + damaged_copies <= total_copies),
  INDEX idx_movie_id (movie_id)
);
```

### 6. **Customers**
```sql
CREATE TABLE customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  preferred_genres VARCHAR(255),
  preferred_languages VARCHAR(255),
  total_spent DECIMAL(12, 2) DEFAULT 0,
  total_rentals INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_phone (phone_number),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### 7. **CustomerPreferences**
```sql
CREATE TABLE customer_preferences (
  preference_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  movie_id INT NOT NULL,
  preference_type ENUM('VIEWED', 'REQUESTED', 'WISHLIST') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  UNIQUE KEY unique_preference (customer_id, movie_id, preference_type),
  INDEX idx_customer (customer_id),
  INDEX idx_movie (movie_id)
);
```

### 8. **Rentals**
```sql
CREATE TABLE rentals (
  rental_id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  customer_id INT,
  employee_id INT NOT NULL,
  rental_start_date DATE NOT NULL,
  rental_due_date DATE NOT NULL,
  actual_return_date DATE,
  rental_duration_days INT NOT NULL,
  rental_price DECIMAL(10, 2) NOT NULL,
  late_fee DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  rental_status ENUM('ACTIVE', 'RETURNED', 'OVERDUE', 'LOST') DEFAULT 'ACTIVE',
  payment_method ENUM('CASH', 'MOBILE_MONEY') NOT NULL,
  mobile_money_reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
  FOREIGN KEY (employee_id) REFERENCES users(user_id),
  INDEX idx_customer (customer_id),
  INDEX idx_employee (employee_id),
  INDEX idx_status (rental_status),
  INDEX idx_rental_date (rental_start_date),
  INDEX idx_due_date (rental_due_date)
);
```

### 9. **Sales**
```sql
CREATE TABLE sales (
  sale_id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  customer_id INT,
  employee_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('CASH', 'MOBILE_MONEY') NOT NULL,
  mobile_money_reference VARCHAR(100),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_translated_copy BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
  FOREIGN KEY (employee_id) REFERENCES users(user_id),
  INDEX idx_employee (employee_id),
  INDEX idx_customer (customer_id),
  INDEX idx_date (transaction_date),
  INDEX idx_movie (movie_id)
);
```

### 10. **ExpenseCategories**
```sql
CREATE TABLE expense_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  INDEX idx_name (category_name)
);
```

### 11. **Expenses**
```sql
CREATE TABLE expenses (
  expense_id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  employee_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  receipt_attachment_path VARCHAR(255),
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by INT,
  approval_date TIMESTAMP,
  expense_date DATE NOT NULL,
  
  FOREIGN KEY (category_id) REFERENCES expense_categories(category_id),
  FOREIGN KEY (employee_id) REFERENCES users(user_id),
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_employee (employee_id),
  INDEX idx_status (status),
  INDEX idx_expense_date (expense_date)
);
```

### 12. **AuditLog**
```sql
CREATE TABLE audit_log (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_user (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_entity (entity_type, entity_id)
);
```

### 13. **DamageReport**
```sql
CREATE TABLE damage_reports (
  damage_id INT PRIMARY KEY AUTO_INCREMENT,
  rental_id INT,
  movie_id INT NOT NULL,
  reported_by INT NOT NULL,
  damage_description TEXT,
  damage_severity ENUM('MINOR', 'MODERATE', 'SEVERE') NOT NULL,
  replacement_cost DECIMAL(10, 2),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  
  FOREIGN KEY (rental_id) REFERENCES rentals(rental_id),
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  FOREIGN KEY (reported_by) REFERENCES users(user_id),
  INDEX idx_movie (movie_id),
  INDEX idx_status (is_resolved)
);
```

---

## Key Constraints & Relationships

| Constraint | Details |
|-----------|---------|
| **Inventory Balance** | `available_copies + rented_out + damaged_copies ≤ total_copies` |
| **Rental Validation** | Cannot rent if `available_copies = 0` |
| **User Uniqueness** | username, email per user; phone per customer |
| **Soft Deletes** | Movies/Users use `is_active` flag instead of deletion |
| **Audit Trail** | All modifications logged in `audit_log` |
| **Late Fees** | Auto-calculated if `actual_return_date > rental_due_date` |

---

## Indexing Strategy

- **High-Frequency Queries**: `rental_start_date`, `transaction_date`, `rental_status`
- **Filtering**: `role`, `is_active`, `category_id`, `language_id`
- **Foreign Keys**: All FK columns indexed automatically
- **Composite Indexes**: `(movie_id, rental_status)` for stock availability checks

---

## Database Views (Recommended)

```sql
-- Dashboard: Today's Sales
CREATE VIEW v_today_sales AS
SELECT 
  DATE(transaction_date) as sale_date,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_income,
  'SALES' as type
FROM sales
WHERE DATE(transaction_date) = CURDATE()
UNION ALL
SELECT 
  DATE(created_at),
  COUNT(*),
  SUM(total_amount),
  'RENTALS'
FROM rentals
WHERE DATE(created_at) = CURDATE();

-- Slow-Moving Stock
CREATE VIEW v_slow_moving_movies AS
SELECT 
  m.movie_id,
  m.title,
  i.total_copies,
  i.available_copies,
  COUNT(r.rental_id) as rental_count_30d,
  COUNT(s.sale_id) as sales_count_30d
FROM movies m
LEFT JOIN inventory i ON m.movie_id = i.movie_id
LEFT JOIN rentals r ON m.movie_id = r.movie_id AND r.rental_start_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
LEFT JOIN sales s ON m.movie_id = s.movie_id AND s.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY m.movie_id
HAVING rental_count_30d + sales_count_30d < 2;
```

---

## Next Steps

1. Implement database migrations
2. Create stored procedures for business logic
3. Set up automated backups
4. Performance testing and optimization
