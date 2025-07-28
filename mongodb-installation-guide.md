## Install on Windows

### Download Installer


- Visit: https://www.mongodb.com/try/download/community
- Choose:
  - Version: Latest
  - OS: Windows
  - Package: MSI
- Download and run the installer

### Install MongoDB


- Use “Complete” setup
- (Optional) Check “Install MongoDB Compass”
- Enable “Install as Service” (recommended)

### Verify Installation


Open Command Prompt and type:

```shell
mongosh
```

### Add to PATH (Optional)


Add C:\Program Files\MongoDB\Server\7.0\bin to your system Path variable to use mongosh globally.


## Install on macOS (Using Homebrew)

### Install Homebrew (if not already installed)

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Add MongoDB Tap

```shell
brew tap mongodb/brew
```

### Install MongoDB

```shell
brew install mongodb-community
```

### Start MongoDB as a Service

```shell
brew services start mongodb/brew/mongodb-community
```

### Verify Installation

```
mongosh
```

## How to connect

### Import Data

```shell
mongosh "mongodb://localhost:27017" < init-data.js
```

`localhost:27017` is your mongodb location 
