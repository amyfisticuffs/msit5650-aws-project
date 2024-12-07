# Project Summary: LingoSphere
## Final project in AWS for MSIT5650 Cloud Computing

I developed an AWS-based language learning application, **LingoSphere**, that integrates both IaaS and SaaS solutions. 

## Infrastructure and Services
For infrastructure, the project leverages AWS IaaS offerings:
- **Application Load Balancer** for routing traffic and enforcing HTTPS.
- **EC2 instances** for backend servers and a bastion host.
- **S3** for audio file storage.
- **Route 53** for domain management.

On the SaaS side, the application incorporates:
- **Amazon Translate** for real-time text translation.
- **Amazon Polly** for generating lifelike speech.

## Application Workflow
The application workflow includes:
1. A user enters text in one language, selects a target language, and clicks **Translate**.
2. A request is sent to **Amazon Translate**, which returns the translated text.
3. The translated text is sent to **Amazon Polly**, which generates an MP3 file stored in **S3**.
4. The translated text is displayed, and the user can play the spoken translation via an audio button.

## Security Practices
To secure the application:
- Acquired an **SSL/TLS certificate** and registered a domain with **Route 53**, enabling encrypted HTTPS access.
- Configured **S3 bucket policies** to deny public `getObject` requests.
- Used **pre-signed URLs** to grant secure, time-limited access to S3 objects (set to expire after six minutes).
- Deployed an **Application Load Balancer** to hide EC2 instance IPs and ensure HTTPS enforcement.
- Established a **bastion host** for managing backend servers, accessible only from my machine’s IP address.
- Placed backend servers in a private subnet with a **NAT gateway** for secure outbound connections.
- Utilized **IAM roles** instead of static security credentials to interact with AWS resources, safeguarding sensitive credentials.

---

This project helped me gain practical experience with cloud computing and AWS services while emphasizing robust security practices.
