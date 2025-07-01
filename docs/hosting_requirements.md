# DIGM Status Board - Hosting Requirements

## Project Overview

The DIGM Status Board is a SvelteKit application that displays real-time information for the Digital Media department at Drexel University. The application shows class schedules, faculty information, countdown timers, weather data, quotes, resources, and event information on digital displays throughout the department.

## Technology Stack

- **Framework**: SvelteKit 2.16.0
- **Language**: TypeScript
- **Package Manager**: pnpm 8.15+
- **Node.js**: 22.0.0+
- **Build Tool**: Vite 6.2.6
- **Database**: MySQL (for gallery/events data)
- **File Watching**: chokidar 4.0.3 (for JSON file monitoring)

## Build Process

### Prerequisites

- Node.js 22.0.0 or later
- pnpm 8.15 or later
- Git access to the repository

## Critical Requirements

### 1. Dynamic JSON File Loading and Watching

**This is the most critical requirement for the application to function properly.**

The application uses a custom Server-Sent Events (SSE) API endpoint at `/api/data-stream` that:

- **Watches JSON files** in the `static/data/` directory for real-time changes
- **Serves live updates** to connected clients when files are modified
- **Maintains persistent connections** for real-time data streaming

#### JSON Files Being Watched

- `static/data/countdown.json` - Important dates and countdown timers
- `static/data/schedule.json` - Class schedule information
- `static/data/faculty.json` - Faculty contact information
- `static/data/resources.json` - Department resources and links
- `static/data/quotes.json` - Rotating inspirational quotes
- `static/data/reels.json` - Video content for displays

#### Technical Implementation

- Uses `chokidar` library for file system watching
- Implements polling-based detection (every 1 second) (polling interval to be increased) for reliable file change detection
- Serves data as Server-Sent Events with proper headers:
  - `Content-Type: text/event-stream`
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`

#### Hosting Implications

- **File system access**: The server must have read access to the JSON files
- **File watching capabilities**: The hosting environment must support file system watching
- **Persistent connections**: The server must support long-running HTTP connections
- **Real-time updates**: Changes to JSON files must be immediately reflected in the application

### 2. Database Connectivity

The application connects to a MySQL database for gallery/events data:

- **Database**: MySQL
- **Connection**: Uses `mysql2` library
- **Purpose**: Fetches events, news, alumni updates, and awards
- **Refresh**: Data refreshes every hour automatically

### 3. External API Dependencies

- **Weather API**: Open-Meteo (<https://api.open-meteo.com/v1/forecast>)
  - Fetches current weather for Philadelphia area
  - Refreshes every 10 minutes
  - No API key required

## Environmental Variables

The following environment variables are required (values intentionally left blank):

```bash
# Database Configuration
DB_HOST=
DB_NAME=
DB_USER=
DB_PASS=
```

## File Structure Requirements

The hosting environment must maintain this file structure:

```txt
/
├── build/                    # Built application files
├── static/
│   ├── data/                # CRITICAL: JSON data files
│   │   ├── countdown.json
│   │   ├── schedule.json
│   │   ├── faculty.json
│   │   ├── resources.json
│   │   ├── quotes.json
│   │   └── reels.json
│   ├── fonts/               # Web fonts
│   ├── manifest.json        # PWA manifest
│   └── favicon files
└── src/                     # Source code (not needed in production)
```

## API Endpoints

### 1. Data Stream Endpoint

- **Path**: `/api/data-stream`
- **Method**: GET
- **Query Parameters**: `data_source` (e.g., `static/data/schedule.json`)
- **Response**: Server-Sent Events stream
- **Purpose**: Real-time JSON data streaming with file watching

### 2. Gallery Data Endpoint

- **Method**: GET
- **Query Parameters**: `page` (pagination)
- **Response**: JSON with gallery posts
- **Purpose**: Events, news, and alumni data

## Performance Requirements

- **Real-time Updates**: JSON file changes must be reflected automatically without manual refresh within a reasonably short period
- **Connection Stability**: SSE connections must remain stable for extended periods
- **File System Performance**: File watching must be efficient and not impact server performance
- **Memory Usage**: File watchers must be properly cleaned up when connections close

## Security Considerations

- **File Access**: Only JSON files in `static/data/` should be accessible via the data stream API
- **Path Validation**: The API validates that `data_source` parameter starts with `static/data/` and ends with `.json` (this can be reconfigured as needed based on final hosting config)
- **Database Security**: Database credentials should be properly secured
- **CORS**: Configure appropriate CORS headers if needed

## Deployment Considerations

### GitLab CI/CD Pipeline Requirements

The hosting environment should support:

1. **GitLab Runner**: For continuous integration
2. **Build Process**: Node.js build environment
3. **Deployment**: Ability to deploy built files to web server
4. **Environment Variables**: Secure storage and injection of environment variables

### Web Server Requirements

- **Static File Serving**: Serve built SvelteKit application
- **API Support**: Handle SvelteKit API routes
- **File System Access**: Read access to JSON files
- **Process Management**: Keep Node.js process running
- **Logging**: Access to application logs

## Monitoring and Maintenance

### Required Monitoring

- **File System Watchers**: Monitor for file watching failures
- **Database Connections**: Monitor database connectivity
- **API Endpoints**: Monitor `/api/data-stream` endpoint health
- **Memory Usage**: Monitor for memory leaks in file watchers

### Maintenance Tasks

- **JSON File Updates**: Regular updates to schedule, faculty, and other data
- **Log Rotation**: Manage application logs
- **Security Updates**: Keep dependencies updated

## Troubleshooting

### Common Issues

1. **File Watching Not Working**
   - Check file system permissions
   - Verify chokidar is properly installed
   - Check for file system limitations

2. **SSE Connections Dropping**
   - Check server timeout settings
   - Verify proxy/load balancer configuration
   - Monitor server resources

3. **Database Connection Issues**
   - Verify database credentials
   - Check network connectivity
   - Monitor database server status

---

**Note**: This document should be reviewed and updated as the application evolves. The dynamic JSON file watching functionality is critical for the application's real-time capabilities and must be properly supported in the hosting environment.
