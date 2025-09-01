export async function onRequestPost({ request, env }) {
	try {
	  const payload = await request.json();

	  // ハニーポット検知（スパム）
	  if (payload.website) {
		return new Response('OK', { status: 200 });
	  }

	  const { name, email, tel = '', type, message } = payload || {};

	  // サーバ側の最低限の検証
	  if (!name || !email || !type || !message) {
		return new Response('Bad Request', { status: 400 });
	  }

	  // Resend API 呼び出し
	  const apiKey = env.RESEND_API_KEY;
	  if (!apiKey) {
		return new Response('Missing RESEND_API_KEY', { status: 500 });
	  }

	  // ★FromはResendで認証済みドメインのアドレスにしてください
	  const from = 'Nomad Rehearsal <no-reply@kikkakemovie.com>';
	  const to = ['kikkake.info5@gmail.com'];
	  const subject = `【お問い合わせ】${name} さん (${type})`;

	  const html = `
		<h3>お問い合わせが届きました</h3>
		<p><strong>お名前:</strong> ${esc(name)}</p>
		<p><strong>メール:</strong> ${esc(email)}</p>
		<p><strong>電話:</strong> ${esc(tel)}</p>
		<p><strong>種別:</strong> ${esc(type)}</p>
		<p><strong>内容:</strong><br>${esc(message).replace(/\n/g,'<br>')}</p>
		<hr>
		<small>送信元: nomadrehearsal.pages.dev</small>
	  `;

	  // 管理者宛
	  const adminRes = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
		  'Authorization': `Bearer ${apiKey}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  from,
		  to,
		  reply_to: email,     // 返信時に送信者へ返信できるように
		  subject,
		  html,
		}),
	  });

	  if (!adminRes.ok) {
		const txt = await adminRes.text();
		return new Response(`Resend error: ${txt}`, { status: 500 });
	  }

	  // （任意）自動返信メール（ユーザー宛）
	  const autoReplyHtml = `
		<p>${esc(name)} 様</p>
		<p>ノマドリハーサルへお問い合わせありがとうございます。内容を確認し、折り返しご連絡いたします。</p>
		<hr>
		<p>【控え】</p>
		<p>種別: ${esc(type)}</p>
		<p>内容:<br>${esc(message).replace(/\n/g,'<br>')}</p>
	  `;

	  await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
		  'Authorization': `Bearer ${apiKey}`,
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  from,
		  to: [email],
		  subject: '【自動返信】お問い合わせありがとうございます',
		  html: autoReplyHtml,
		}),
	  });

	  return new Response('OK', { status: 200 });
	} catch (err) {
	  return new Response(`Server error: ${err}`, { status: 500 });
	}
  }

  function esc(str = '') {
	return String(str)
	  .replace(/&/g,'&amp;')
	  .replace(/</g,'&lt;')
	  .replace(/>/g,'&gt;')
	  .replace(/"/g,'&quot;')
	  .replace(/'/g,'&#39;');
  }
