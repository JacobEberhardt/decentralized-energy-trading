FROM python:3.7-alpine

# Add template for service configuration
COPY template-smdservice.toml /home/blogpv/template-smdservice.toml

# Add initialization script that executes at entrypoint
# COPY --chown=openethereum init.sh /home/blogpv/init.sh

RUN pip install -r requirements.txt

CMD ["gunicorn", "-w 4", "main:app"]
