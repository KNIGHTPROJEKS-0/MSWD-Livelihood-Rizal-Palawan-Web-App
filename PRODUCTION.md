# 🏭 MSWD Production Guide

## 📋 Production Overview

This guide covers production-specific configurations, monitoring, maintenance, and operational procedures for the MSWD Livelihood Rizal Palawan Web Application.

## 🌐 Production Environment

### Current Production Setup
- **Frontend**: https://mswd-frontend-production.railway.app
- **API**: https://mswd-api-production.railway.app
- **Database**: PostgreSQL 15 (Railway managed)
- **Cache**: Redis 7 (Railway managed)
- **Storage**: Firebase Storage
- **Workflows**: n8n automation platform
- **Monitoring**: Railway metrics + custom health checks

### Infrastructure Specifications
- **API Server**: 2 vCPU, 4GB RAM, auto-scaling
- **Database**: PostgreSQL with automated backups
- **Cache**: Redis with persistence enabled
- **Storage**: Firebase Storage with CDN
- **SSL**: Automatic HTTPS with Railway

## 🔐 Production Security

### Authentication & Authorization
```bash
# Production JWT configuration
SECRET_KEY=<256-bit-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Role-based access control
SUPERADMIN_ROLES=["superadmin"]
ADMIN_ROLES=["admin", "mswd_staff"]
USER_ROLES=["beneficiary"]
```

### Security Headers
```python
# Production security middleware
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
    "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

### Data Protection
- **Encryption**: All data encrypted at rest and in transit
- **PII Handling**: Personal data anonymized in logs
- **Audit Logging**: All user actions logged with timestamps
- **Backup Encryption**: Database backups encrypted
- **Access Control**: Principle of least privilege

## 📊 Monitoring & Observability

### Health Monitoring
```bash
# API health endpoints
GET /health                 # Basic health status
GET /health/detailed        # Comprehensive health check
GET /health/db             # Database connectivity
GET /health/redis          # Cache connectivity
GET /health/firebase       # Firebase services
```

### Key Metrics
```bash
# Application metrics
- API response time (target: <500ms)
- Error rate (target: <1%)
- Throughput (requests/second)
- Active users (concurrent)
- Database connections
- Memory usage
- CPU utilization

# Business metrics
- Application submissions/day
- User registrations/day
- Program enrollments/day
- Document uploads/day
- Notification delivery rate
```

### Alerting Rules
```yaml
# Critical alerts (immediate response)
- API down (>5 minutes)
- Database connection failure
- High error rate (>5% for 5 minutes)
- Memory usage >90%
- Disk space <10%

# Warning alerts (monitor closely)
- Response time >1s (sustained)
- Error rate >2%
- Memory usage >80%
- Database slow queries
- Failed backup jobs
```

### Log Management
```bash
# Log levels in production
ERROR: System errors, exceptions
WARN: Performance issues, deprecated features
INFO: User actions, system events
DEBUG: Disabled in production

# Log retention
- Application logs: 30 days
- Audit logs: 7 years (compliance)
- Access logs: 90 days
- Error logs: 1 year
```

## 🗄️ Database Management

### Production Database Configuration
```sql
-- Performance optimization
shared_preload_libraries = 'pg_stat_statements'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

-- Monitoring
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000
```

### Backup Strategy
```bash
# Automated backups (Railway managed)
- Full backup: Daily at 2 AM UTC
- Point-in-time recovery: 7 days
- Backup retention: 30 days
- Cross-region replication: Enabled

# Manual backup procedures
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup verification
pg_restore --list backup_file.sql
```

### Database Maintenance
```sql
-- Weekly maintenance tasks
VACUUM ANALYZE;
REINDEX DATABASE mswd_production;

-- Monitor table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🚀 Performance Optimization

### API Performance
```python
# Production optimizations
- Connection pooling (max 20 connections)
- Query optimization with indexes
- Response caching (Redis)
- Async request handling
- Request rate limiting
- Response compression (gzip)
```

### Frontend Performance
```javascript
// Production build optimizations
- Code splitting and lazy loading
- Bundle size optimization
- Image optimization (WebP)
- CDN for static assets
- Service worker caching
- Tree shaking
```

### Database Performance
```sql
-- Critical indexes
CREATE INDEX CONCURRENTLY idx_applications_status ON applications(status);
CREATE INDEX CONCURRENTLY idx_applications_created_at ON applications(created_at);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_programs_active ON programs(is_active);

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM applications WHERE status = 'pending';
```

## 🔄 Deployment Procedures

### Production Deployment Process
```bash
# 1. Pre-deployment checks
- All tests passing
- Code review completed
- Database migrations tested
- Environment variables updated
- Rollback plan prepared

# 2. Deployment execution
./deploy-production.sh

# 3. Post-deployment verification
- Health checks passing
- Critical user flows tested
- Performance metrics normal
- Error rates within limits
```

### Zero-Downtime Deployment
```bash
# Blue-green deployment strategy
1. Deploy to staging environment
2. Run smoke tests
3. Switch traffic gradually (10%, 50%, 100%)
4. Monitor metrics during rollout
5. Rollback if issues detected
```

### Rollback Procedures
```bash
# Quick rollback (if needed)
railway rollback --service api
railway rollback --service frontend

# Database rollback (if schema changes)
alembic downgrade -1

# Verify rollback success
curl https://api-domain.com/health
```

## 🔧 Maintenance Procedures

### Regular Maintenance Tasks

#### Daily
- [ ] Check system health dashboard
- [ ] Review error logs
- [ ] Monitor performance metrics
- [ ] Verify backup completion

#### Weekly
- [ ] Database maintenance (VACUUM, REINDEX)
- [ ] Security updates review
- [ ] Performance trend analysis
- [ ] Capacity planning review

#### Monthly
- [ ] Security audit
- [ ] Dependency updates
- [ ] Performance optimization review
- [ ] Disaster recovery testing
- [ ] User access review

#### Quarterly
- [ ] Full security assessment
- [ ] Infrastructure cost optimization
- [ ] Compliance audit
- [ ] Business continuity testing

### Maintenance Windows
```bash
# Scheduled maintenance
- Time: Sundays 2:00-4:00 AM UTC (low usage)
- Duration: Maximum 2 hours
- Notification: 48 hours advance notice
- Rollback: Always prepared
```

## 🚨 Incident Response

### Incident Classification
```bash
# Severity 1 (Critical)
- Complete system outage
- Data breach or security incident
- Data corruption or loss

# Severity 2 (High)
- Partial system outage
- Performance degradation >50%
- Authentication failures

# Severity 3 (Medium)
- Minor feature issues
- Performance degradation <50%
- Non-critical bugs

# Severity 4 (Low)
- Cosmetic issues
- Enhancement requests
- Documentation updates
```

### Response Procedures
```bash
# Incident response steps
1. Acknowledge incident (within 15 minutes)
2. Assess severity and impact
3. Implement immediate mitigation
4. Communicate with stakeholders
5. Investigate root cause
6. Implement permanent fix
7. Post-incident review
8. Update procedures
```

### Emergency Contacts
```bash
# On-call rotation
Primary: knightprojeks@gmail.com
Secondary: backup-contact@domain.com
Escalation: management-contact@domain.com

# External contacts
Railway Support: support@railway.app
Firebase Support: firebase-support@google.com
```

## 📈 Capacity Planning

### Current Usage Metrics
```bash
# User metrics
- Active users: ~500/day
- Peak concurrent users: ~50
- API requests: ~10,000/day
- Database queries: ~50,000/day
- File uploads: ~100/day

# Resource utilization
- CPU: 30-40% average
- Memory: 60-70% average
- Database: 40% storage used
- Bandwidth: 10GB/month
```

### Scaling Thresholds
```bash
# Auto-scaling triggers
- CPU >70% for 5 minutes: Scale up
- Memory >80% for 5 minutes: Scale up
- Response time >2s: Scale up
- Error rate >3%: Investigate

# Manual scaling considerations
- User growth >50%: Review infrastructure
- New features: Capacity assessment
- Seasonal peaks: Pre-scale resources
```

## 💰 Cost Optimization

### Current Costs (Monthly)
```bash
# Infrastructure costs
- Railway hosting: $50-100
- Firebase services: $20-50
- Domain and SSL: $15
- Monitoring tools: $30
- Total: ~$115-195/month
```

### Cost Optimization Strategies
```bash
# Resource optimization
- Right-size instances based on usage
- Use spot instances for non-critical workloads
- Implement auto-scaling policies
- Optimize database queries
- Use CDN for static content

# Service optimization
- Review unused services monthly
- Optimize data transfer costs
- Use reserved instances for predictable workloads
- Monitor and alert on cost spikes
```

## 📋 Compliance & Governance

### Data Governance
```bash
# Data classification
- Public: Program information, general announcements
- Internal: User statistics, system logs
- Confidential: User PII, application details
- Restricted: Authentication credentials, API keys

# Data retention policies
- User data: Retained while account active + 2 years
- Application data: 7 years (government requirement)
- Audit logs: 7 years
- System logs: 1 year
```

### Compliance Requirements
```bash
# Philippine Data Privacy Act compliance
- User consent for data collection
- Right to data portability
- Right to be forgotten
- Data breach notification (72 hours)
- Privacy impact assessments

# Government requirements
- Audit trail maintenance
- Data sovereignty (Philippines)
- Accessibility compliance (WCAG 2.1)
- Security standards compliance
```

## 📞 Production Support

### Support Channels
- **Critical Issues**: knightprojeks@gmail.com (24/7)
- **General Support**: GitHub Issues
- **User Support**: In-app help system
- **Documentation**: Production runbooks

### Support SLAs
```bash
# Response times
- Severity 1: 15 minutes
- Severity 2: 1 hour
- Severity 3: 4 hours
- Severity 4: 24 hours

# Resolution times
- Severity 1: 2 hours
- Severity 2: 8 hours
- Severity 3: 24 hours
- Severity 4: 72 hours
```

---

**Last Updated**: January 2025  
**Production Status**: ✅ Live and Monitored  
**Next Review**: February 2025