# Plano de Configuração do Google OAuth

Este plano descreve os passos para configurar a autenticação do Google (SSO) no CRM QuimeraTech, permitindo que utilize o seu próprio ID de Cliente e Segredo do Google Cloud Console para maior segurança e personalização.

## 1. Configuração no Google Cloud Console
1. Aceda ao [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto ou selecione um existente.
3. Vá a **APIs & Services > OAuth consent screen**.
   - Escolha o tipo de utilizador (Internal ou External).
   - Preencha os detalhes obrigatórios (App name, User support email, Developer contact info).
   - Adicione o domínio `hjafzqbxzjmzolkwmsme.supabase.co` aos domínios autorizados.
4. Vá a **APIs & Services > Credentials**.
   - Clique em **Create Credentials > OAuth client ID**.
   - Selecione **Web application**.
   - Em **Authorized JavaScript origins**, adicione:
     - `https://hjafzqbxzjmzolkwmsme.supabase.co`
     - `https://id-preview--29feba2e-d9c3-4226-9ef6-edc5b817c4e3.lovable.app`
   - Em **Authorized redirect URIs**, adicione:
     - `https://hjafzqbxzjmzolkwmsme.supabase.co/auth/v1/callback`
5. Guarde o **Client ID** e o **Client Secret**.

## 2. Configuração no Painel do Lovable Cloud
Vou configurar o backend para aceitar o provedor Google. Para finalizar, precisará de inserir as credenciais no painel:

1. Clique no botão **View Backend** abaixo.
2. Navegue para **Authentication > Providers > Google**.
3. Ative o Google.
4. Insira o **Client ID** e o **Client Secret** obtidos no passo anterior.
5. Guarde as alterações.

## 3. Implementação da Página de Login
Criarei uma página dedicada em `/auth` para facilitar o acesso ao CRM:
- Botão "Entrar com Google".
- Redirecionamento automático para o Dashboard após login.
- Feedback visual de carregamento.

## Detalhes Técnicos
- **URL do Callback**: `https://hjafzqbxzjmzolkwmsme.supabase.co/auth/v1/callback`
- **Framework**: TanStack Start v1 + Supabase Auth.
- **Segurança**: RLS e verificação de roles (`admin`) mantidas.

---
**Por favor, confirme se tem acesso ao Google Cloud Console para começarmos.**
