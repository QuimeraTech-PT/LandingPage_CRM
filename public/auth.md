# QuimeraTech auth.md

```yaml
agent_auth:
	skill: https://quimeratech.com/auth.md
	register_uri: https://quimeratech.com/#contact
	method: manual
	registration_method: manual
	methods_supported: [manual]
	registration_methods:
		- name: Manual agent provisioning
			method: manual
			type: manual
			register_uri: https://quimeratech.com/#contact
			request: Email general@quimeratech.com with the agent identity, organization, purpose, and requested services.
			approval: QuimeraTech validates the request and sends credentials and endpoint instructions directly to the approved technical contact.
			credentials: Provisioned privately after explicit approval; no credentials are issued by this public document.
```

## Agent audience

This document is intended for AI agents and automated integrations that need to request access to QuimeraTech's private services.

## Registration

There is no public automated agent registration. The authentication area and administrative operations are protected and must not be accessed by crawlers or unauthorized agents.

To request access, email [general@quimeratech.com](mailto:general@quimeratech.com) with:

- The agent's identity and responsible organization
- The intended purpose and requested services
- A technical contact for the validation process

When approved, access is provisioned manually by QuimeraTech. Credentials and usage instructions are provided directly to the validated owner and must not be included in URLs, public prompts, or discovery files.

## Supported method

- Manual, by invitation and email validation

The registration endpoint is `https://quimeratech.com/#contact`. This is a manual provisioning channel, not an automated API. The request must identify the agent and its organization, state the intended purpose and requested services, and provide a technical contact. QuimeraTech reviews the request and, if approved, privately provides the credentials and endpoint instructions.

### Registration method: manual

- `register_uri`: https://quimeratech.com/#contact
- `method`: manual
- `request`: Submit the agent identity, organization, purpose, requested services, and technical contact through the contact form.
- `approval`: QuimeraTech reviews the request and contacts the approved technical owner by email.
- `credentials`: Credentials are provisioned privately after approval; this public page never issues or accepts credentials.

`methods_supported`: `manual`

There is currently no public registration endpoint, OAuth Authorization Server, or anonymous credentials available to agents.

The public OAuth Protected Resource Metadata document is available at [`/.well-known/oauth-protected-resource`](https://quimeratech.com/.well-known/oauth-protected-resource). It identifies `https://quimeratech.com` as the private issuer for the protected resource. The corresponding metadata is available at [`/.well-known/oauth-authorization-server`](https://quimeratech.com/.well-known/oauth-authorization-server).

This metadata does not provide a public automated OAuth registration or token flow. The authorization endpoint remains private and requires the credential supplied directly by QuimeraTech after manual approval.

The privately provisioned access scope is `agent:access`.

## Credential use

Never send credentials to the homepage, this document, or administrative endpoints. Use only the credentials and endpoints provided by QuimeraTech after explicit approval.

## Public resources

- Website: https://quimeratech.com/
- Provisioning contact: mailto:general@quimeratech.com