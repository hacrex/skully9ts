# Design Document

## Overview

This design addresses the database layer inconsistencies in the Skully9Ts application by standardizing on Firebase Realtime Database, implementing missing service methods, and ensuring consistent error handling throughout the application. The solution will maintain the existing API structure while fixing the underlying database operations.

## Architecture

### Database Service Selection

After analyzing the current codebase, we will standardize on **Firebase Realtime Database** because:
- The `realtimeService.js` already has most methods implemented
- The Firebase config includes Realtime Database URL
- The existing data structure works well with Realtime Database's JSON format
- Simpler migration path from current state

### Service Layer Structure

```
services/
├── databaseService.js (unified service)
├── userService.js (user-specific operations)
├── productService.js (product-specific operations)
└── orderService.js (order-specific operations)
```

## Components and Interfaces

### 1. Database Service (databaseService.js)

**Purpose**: Unified database connection and basic operations

```javascript
class DatabaseService {
  constructor()
  getDatabase()
  validateConnection()
  handleError(error, operation)
}
```

### 2. User Service (userService.js)

**Purpose**: User-related database operations

```javascript
class UserService {
  async createUser(userData)
  async getUserById(userId)
  async getUserByEmail(email)
  async updateUser(userId, updateData)
  async deleteUser(userId)
  async validateUserCredentials(email, password)
  async updateLastLogin(userId)
}
```

### 3. Product Service (productService.js)

**Purpose**: Product-related database operations with filtering and pagination

```javascript
class ProductService {
  async createProduct(productData)
  async getProductById(productId)
  async getAllProducts(filters = {})
  async updateProduct(productId, updateData)
  async deleteProduct(productId)
  async addProductReview(productId, reviewData)
  async getProductsByCategory(category)
  async searchProducts(searchTerm)
  async getProductsPaginated(page, limit, filters)
}
```

### 4. Order Service (orderService.js)

**Purpose**: Order-related database operations

```javascript
class OrderService {
  async createOrder(orderData)
  async getOrderById(orderId)
  async getOrdersByUser(userId)
  async updateOrder(orderId, updateData)
  async deleteOrder(orderId)
  async updateOrderStatus(orderId, status)
  async getOrdersWithPagination(page, limit, filters)
}
```

## Data Models

### User Data Structure
```javascript
{
  id: string,
  email: string,
  password: string (hashed),
  firstName: string,
  lastName: string,
  role: string (default: 'user'),
  createdAt: timestamp,
  lastLogin: timestamp,
  isActive: boolean
}
```

### Product Data Structure
```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  category: string,
  images: array,
  inventory: number,
  supplierVariantId: string,
  reviews: array,
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean
}
```

### Order Data Structure
```javascript
{
  id: string,
  userId: string,
  items: array,
  shippingAddress: object,
  billingAddress: object,
  paymentInfo: object,
  subtotal: number,
  total: number,
  status: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Error Handling

### Error Response Format
```javascript
{
  success: boolean,
  data: any,
  error: {
    code: string,
    message: string,
    details: any
  }
}
```

### Error Categories
- **ValidationError**: Invalid input data
- **NotFoundError**: Resource not found
- **DatabaseError**: Database operation failed
- **AuthenticationError**: Authentication failed
- **AuthorizationError**: Insufficient permissions

### Logging Strategy
- Use structured logging with consistent format
- Log all database operations with timing
- Include request context in error logs
- Separate error logs by severity level

## Testing Strategy

### Unit Tests
- Test each service method independently
- Mock Firebase database operations
- Test error handling scenarios
- Validate input/output data formats

### Integration Tests
- Test service interactions with real Firebase
- Test API endpoints with database operations
- Verify authentication flow with database
- Test pagination and filtering functionality

### Test Data Management
- Use Firebase emulator for testing
- Create test data fixtures
- Clean up test data after each test
- Separate test and development databases

## Migration Strategy

### Phase 1: Service Layer Refactoring
1. Create new service classes
2. Implement missing methods
3. Update existing methods for consistency
4. Add comprehensive error handling

### Phase 2: Route Integration
1. Update routes to use new services
2. Fix authentication middleware
3. Test all API endpoints
4. Update error responses

### Phase 3: Validation and Cleanup
1. Remove unused code
2. Update configuration
3. Add comprehensive logging
4. Performance optimization

## Performance Considerations

### Database Optimization
- Use Firebase indexing for common queries
- Implement efficient pagination
- Cache frequently accessed data
- Optimize query structures

### Connection Management
- Reuse database connections
- Implement connection pooling if needed
- Handle connection timeouts gracefully
- Monitor connection health

## Security Considerations

### Data Validation
- Validate all input data before database operations
- Sanitize user inputs to prevent injection
- Implement rate limiting for API endpoints
- Use parameterized queries where applicable

### Access Control
- Implement proper role-based access control
- Validate user permissions before operations
- Log all administrative actions
- Secure sensitive data fields