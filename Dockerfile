FROM python:3.11-slim

# Set up a new user to run the app (Hugging Face requirement)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Set working directory to the app root
WORKDIR $HOME/app

# Copy the entire project (backend, frontend, Model Data) into the container
COPY --chown=user . $HOME/app

# Change working directory to backend so uvicorn can find main.py easily
WORKDIR $HOME/app/backend

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Hugging Face Spaces automatically routes traffic to port 7860
EXPOSE 7860

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
