FROM python:3.14-slim

WORKDIR /app

# Install required Python packages
RUN pip install --no-cache-dir requests

# Copy the script
COPY guessrLeaderboard.py ./

# Run as non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Run the script
CMD ["python", "guessrLeaderboard.py"]
