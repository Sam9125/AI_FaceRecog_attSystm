# Contributing Guide

Thank you for considering contributing to the AI Face Recognition Attendance System!

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Python version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Code Contributions

#### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/attendance-system.git
cd attendance-system

# Create a new branch
git checkout -b feature/your-feature-name

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend
npm install
```

#### Code Style Guidelines

**Python (Backend)**
- Follow PEP 8 style guide
- Use type hints where possible
- Write docstrings for functions and classes
- Keep functions focused and small
- Use meaningful variable names

```python
# Good
def calculate_attendance_percentage(present_days: int, total_days: int) -> float:
    """
    Calculate attendance percentage.
    
    Args:
        present_days: Number of days present
        total_days: Total number of days
        
    Returns:
        Attendance percentage (0-100)
    """
    if total_days == 0:
        return 0.0
    return (present_days / total_days) * 100
```

**JavaScript (Frontend)**
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful component and variable names

```javascript
// Good
const AttendanceCard = ({ title, value, icon }) => {
  return (
    <Card>
      <CardContent>
        {icon}
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2">{title}</Typography>
      </CardContent>
    </Card>
  );
};
```

#### Testing

**Backend Tests**
```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=. tests/
```

**Frontend Tests**
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

#### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(attendance): add multi-face detection support

Implemented functionality to detect and mark attendance
for multiple people in a single image.

Closes #123
```

```
fix(auth): resolve token expiration issue

Fixed bug where tokens were expiring prematurely due to
incorrect timezone handling.
```

#### Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update API documentation
   - Update CHANGELOG.md

2. **Test Your Changes**
   - Write tests for new features
   - Ensure all tests pass
   - Test manually in browser

3. **Create Pull Request**
   - Use a clear title
   - Describe what changes were made
   - Reference related issues
   - Add screenshots for UI changes

4. **Code Review**
   - Address review comments
   - Keep discussions professional
   - Be open to suggestions

5. **Merge**
   - Squash commits if needed
   - Delete branch after merge

## 🎯 Areas for Contribution

### High Priority
- [ ] Improve face recognition accuracy
- [ ] Add more liveness detection methods
- [ ] Implement email notifications
- [ ] Add mobile app support
- [ ] Improve performance optimization

### Medium Priority
- [ ] Add more chart types to dashboard
- [ ] Implement advanced reporting
- [ ] Add export to PDF
- [ ] Implement WebSocket for real-time updates
- [ ] Add user profile management

### Low Priority
- [ ] Add dark mode theme
- [ ] Implement internationalization (i18n)
- [ ] Add more customization options
- [ ] Improve error messages
- [ ] Add more unit tests

## 📝 Development Workflow

1. **Pick an Issue**
   - Look for issues labeled `good first issue` or `help wanted`
   - Comment on the issue to claim it

2. **Develop**
   - Create a feature branch
   - Write code following style guidelines
   - Write tests
   - Update documentation

3. **Test**
   - Run all tests
   - Test manually
   - Check for edge cases

4. **Submit**
   - Push to your fork
   - Create pull request
   - Wait for review

5. **Iterate**
   - Address feedback
   - Update PR
   - Get approval

6. **Celebrate!**
   - Your contribution is merged
   - Thank you for contributing!

## 🐛 Debugging Tips

### Backend Debugging
```python
# Add logging
import logging
logger = logging.getLogger(__name__)
logger.debug("Debug message")

# Use debugger
import pdb; pdb.set_trace()
```

### Frontend Debugging
```javascript
// Console logging
console.log('Debug:', variable);

// React DevTools
// Install React DevTools browser extension
```

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [face_recognition Library](https://github.com/ageitgey/face_recognition)
- [Material-UI Documentation](https://mui.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 💬 Communication

- GitHub Issues: Bug reports and feature requests
- Pull Requests: Code contributions
- Discussions: General questions and ideas

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to make this project better! 🎉
