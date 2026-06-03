const screens = [
  'Landing',
  'Login',
  'Register',
  'OAuth 42',
  'OAuth Provider',
  'Forgot Password',
  'Reset Password',
  'Profile',
  'Protected Library',
  'Logout'
];

const stateNodes = [
  { id: 'Anonymous', x: 12, y: 18 },
  { id: 'Login Form', x: 34, y: 18 },
  { id: 'Register Form', x: 56, y: 18 },
  { id: 'Validating', x: 78, y: 18 },
  { id: 'Authenticated', x: 88, y: 45 },
  { id: 'OAuth Redirect', x: 61, y: 45 },
  { id: 'Password Reset', x: 35, y: 45 },
  { id: 'Profile Editing', x: 60, y: 72 },
  { id: 'Unauthorized', x: 18, y: 72 },
  { id: 'Error', x: 38, y: 72 },
  { id: 'Logged Out', x: 83, y: 72 }
];

const edges = [
  ['Anonymous', 'Login Form'],
  ['Anonymous', 'Register Form'],
  ['Login Form', 'Validating'],
  ['Register Form', 'Validating'],
  ['Validating', 'Authenticated'],
  ['Login Form', 'OAuth Redirect'],
  ['OAuth Redirect', 'Authenticated'],
  ['Password Reset', 'Logged Out'],
  ['Authenticated', 'Profile Editing'],
  ['Authenticated', 'Logged Out'],
  ['Anonymous', 'Unauthorized'],
  ['Validating', 'Error'],
  ['Unauthorized', 'Login Form'],
  ['Error', 'Login Form']
];

const flows = {
  Landing: [],
  Login: [
    {
      id: 'login-valid',
      label: 'Submit valid login',
      nextState: 'Authenticated',
      screen: 'Login',
      route: 'POST /auth/login',
      method: 'POST',
      requestPayload: { login: 'from login form', password: '********' },
      responsePayload: { accessToken: 'mock.jwt', refreshToken: 'mock.refresh', user: { id: 42, username: 'hypertuber' } },
      status: 200,
      errorCode: '',
      userMessage: 'Welcome back.',
      qaTestCase: 'LOGIN-HP-001: Valid credentials authenticate user.',
      securityNotes: 'Use throttling and constant-time credential comparison.'
    },
    {
      id: 'login-invalid',
      label: 'Submit invalid login',
      nextState: 'Error',
      screen: 'Login',
      route: 'POST /auth/login',
      method: 'POST',
      requestPayload: { login: 'wrong@example.com', password: '********' },
      responsePayload: { error: { code: 'INVALID_CREDENTIALS', message: 'Username or password is invalid.' } },
      status: 401,
      errorCode: 'INVALID_CREDENTIALS',
      userMessage: 'Username or password is invalid.',
      qaTestCase: 'LOGIN-ERR-002: Invalid credentials return 401.',
      securityNotes: 'Do not reveal which field was incorrect.'
    },
    {
      id: 'login-missing-password',
      label: 'Missing password',
      nextState: 'Error',
      screen: 'Login',
      route: 'POST /auth/login',
      method: 'POST',
      requestPayload: { login: 'user@example.com' },
      responsePayload: { error: { code: 'REQUIRED_FIELD', field: 'password', message: 'Password is required.' } },
      status: 400,
      errorCode: 'REQUIRED_FIELD',
      userMessage: 'Password is required.',
      qaTestCase: 'LOGIN-VAL-003: Missing password returns required field error.',
      securityNotes: 'Validate mandatory fields server-side and client-side.'
    }
  ],
  Register: [
    {
      id: 'register-valid',
      label: 'Submit valid registration',
      nextState: 'Authenticated',
      screen: 'Register',
      route: 'POST /auth/register',
      method: 'POST',
      requestPayload: { username: 'newuser', email: 'new@hypertube.dev', password: 'StrongPass!2' },
      responsePayload: { userId: 108, username: 'newuser', email: 'new@hypertube.dev' },
      status: 201,
      errorCode: '',
      userMessage: 'Account created successfully.',
      qaTestCase: 'REG-HP-001: Valid registration returns 201.',
      securityNotes: 'Apply password policy and email verification flow.'
    },
    {
      id: 'register-email-taken',
      label: 'Email already taken',
      nextState: 'Error',
      screen: 'Register',
      route: 'POST /auth/register',
      method: 'POST',
      requestPayload: { username: 'existing', email: 'taken@hypertube.dev', password: 'StrongPass!2' },
      responsePayload: { error: { code: 'EMAIL_TAKEN', message: 'Email is already registered.' } },
      status: 409,
      errorCode: 'EMAIL_TAKEN',
      userMessage: 'Email is already registered.',
      qaTestCase: 'REG-ERR-002: Existing email returns 409.',
      securityNotes: 'Avoid verbose account-existence details in public endpoints.'
    },
    {
      id: 'register-weak-password',
      label: 'Weak password',
      nextState: 'Error',
      screen: 'Register',
      route: 'POST /auth/register',
      method: 'POST',
      requestPayload: { username: 'newuser', email: 'new@hypertube.dev', password: '123' },
      responsePayload: { error: { code: 'WEAK_PASSWORD', message: 'Password is too weak.' } },
      status: 400,
      errorCode: 'WEAK_PASSWORD',
      userMessage: 'Password is too weak.',
      qaTestCase: 'REG-VAL-003: Weak password rejected.',
      securityNotes: 'Enforce entropy requirements and deny known breached passwords.'
    }
  ],
  'OAuth 42': [
    {
      id: 'oauth42-start',
      label: 'Start OAuth 42',
      nextState: 'OAuth Redirect',
      screen: 'OAuth 42',
      route: 'GET /auth/oauth/42',
      method: 'GET',
      requestPayload: { provider: '42' },
      responsePayload: { redirect: 'https://api.intra.42.fr/oauth/authorize?...' },
      status: 302,
      errorCode: '',
      userMessage: 'Redirecting to 42 provider.',
      qaTestCase: 'OAUTH42-HP-001: Start OAuth redirects user.',
      securityNotes: 'Generate and store CSRF state before redirect.'
    },
    {
      id: 'oauth42-success',
      label: 'Callback success',
      nextState: 'Authenticated',
      screen: 'OAuth 42',
      route: 'GET /auth/oauth/callback',
      method: 'GET',
      requestPayload: { code: 'oauth-code', state: 'valid-state' },
      responsePayload: { accessToken: 'mock.jwt', user: { id: 42, provider: '42' } },
      status: 200,
      errorCode: '',
      userMessage: 'OAuth login successful.',
      qaTestCase: 'OAUTH42-HP-002: Callback success authenticates user.',
      securityNotes: 'Validate state, nonce, and callback origin.'
    },
    {
      id: 'oauth42-failed',
      label: 'Callback failed',
      nextState: 'Error',
      screen: 'OAuth 42',
      route: 'GET /auth/oauth/callback',
      method: 'GET',
      requestPayload: { error: 'access_denied' },
      responsePayload: { error: { code: 'OAUTH_PROVIDER_FAILED', message: 'OAuth provider failed. Try again.' } },
      status: 401,
      errorCode: 'OAUTH_PROVIDER_FAILED',
      userMessage: 'OAuth provider failed. Try again.',
      qaTestCase: 'OAUTH42-ERR-003: Failed callback returns auth error.',
      securityNotes: 'Never trust provider payload without signature/state checks.'
    }
  ],
  'OAuth Provider': [
    {
      id: 'oauth-provider-start',
      label: 'Start OAuth provider',
      nextState: 'OAuth Redirect',
      screen: 'OAuth Provider',
      route: 'GET /auth/oauth/provider',
      method: 'GET',
      requestPayload: { provider: 'generic' },
      responsePayload: { redirect: 'https://provider.example/oauth/authorize?...' },
      status: 302,
      errorCode: '',
      userMessage: 'Redirecting to provider.',
      qaTestCase: 'OAUTHGEN-HP-001: Secondary provider redirect works.',
      securityNotes: 'Use strict allowlist for provider callback URLs.'
    }
  ],
  'Forgot Password': [
    {
      id: 'forgot-send',
      label: 'Send reset email',
      nextState: 'Password Reset',
      screen: 'Forgot Password',
      route: 'POST /auth/password/forgot',
      method: 'POST',
      requestPayload: { email: 'user@hypertube.dev' },
      responsePayload: { message: 'If an account exists, an email has been sent.' },
      status: 200,
      errorCode: '',
      userMessage: 'Reset instructions have been sent.',
      qaTestCase: 'FORGOT-HP-001: Forgot password responds with generic success.',
      securityNotes: 'Always return generic message to prevent account enumeration.'
    },
    {
      id: 'forgot-unknown',
      label: 'Unknown email',
      nextState: 'Password Reset',
      screen: 'Forgot Password',
      route: 'POST /auth/password/forgot',
      method: 'POST',
      requestPayload: { email: 'unknown@hypertube.dev' },
      responsePayload: { message: 'If an account exists, an email has been sent.' },
      status: 200,
      errorCode: '',
      userMessage: 'If an account exists, an email has been sent.',
      qaTestCase: 'FORGOT-SEC-002: Unknown email keeps same response message.',
      securityNotes: 'Response parity protects against email discovery.'
    }
  ],
  'Reset Password': [
    {
      id: 'reset-valid-token',
      label: 'Valid token',
      nextState: 'Logged Out',
      screen: 'Reset Password',
      route: 'POST /auth/password/reset',
      method: 'POST',
      requestPayload: { token: 'valid-token', password: 'StrongPass!4' },
      responsePayload: { message: 'Password changed. Please log in again.' },
      status: 200,
      errorCode: '',
      userMessage: 'Password changed. Please log in again.',
      qaTestCase: 'RESET-HP-001: Valid token resets password and logs out sessions.',
      securityNotes: 'Invalidate all active sessions after password reset.'
    },
    {
      id: 'reset-expired-token',
      label: 'Expired token',
      nextState: 'Error',
      screen: 'Reset Password',
      route: 'POST /auth/password/reset',
      method: 'POST',
      requestPayload: { token: 'expired-token', password: 'StrongPass!4' },
      responsePayload: { error: { code: 'RESET_TOKEN_EXPIRED', message: 'Reset link expired. Request a new one.' } },
      status: 410,
      errorCode: 'RESET_TOKEN_EXPIRED',
      userMessage: 'Reset link expired. Request a new one.',
      qaTestCase: 'RESET-ERR-002: Expired token returns 410.',
      securityNotes: 'Short token TTL and one-time use required.'
    }
  ],
  Profile: [
    {
      id: 'profile-load',
      label: 'Load my profile',
      nextState: 'Authenticated',
      screen: 'Profile',
      route: 'GET /me',
      method: 'GET',
      requestPayload: null,
      responsePayload: { id: 42, username: 'hypertuber', email: 'user@hypertube.dev', avatar: null },
      status: 200,
      errorCode: '',
      userMessage: 'Profile loaded.',
      qaTestCase: 'PROFILE-HP-001: Authenticated profile fetch succeeds.',
      securityNotes: 'Return only authorized fields for current identity.'
    },
    {
      id: 'profile-update-own',
      label: 'Update my profile',
      nextState: 'Profile Editing',
      screen: 'Profile',
      route: 'PATCH /me',
      method: 'PATCH',
      requestPayload: { username: 'hypertuber-updated' },
      responsePayload: { id: 42, username: 'hypertuber-updated' },
      status: 200,
      errorCode: '',
      userMessage: 'Profile updated.',
      qaTestCase: 'PROFILE-HP-002: User can update own profile.',
      securityNotes: 'Require valid session and sanitize user-controlled strings.'
    },
    {
      id: 'profile-update-other',
      label: 'Try to update another user',
      nextState: 'Error',
      screen: 'Profile',
      route: 'PATCH /users/:id',
      method: 'PATCH',
      requestPayload: { id: 7, role: 'admin' },
      responsePayload: { error: { code: 'FORBIDDEN', message: 'You do not have access to this action.' } },
      status: 403,
      errorCode: 'FORBIDDEN',
      userMessage: 'You do not have access to this action.',
      qaTestCase: 'PROFILE-AUTHZ-003: Cross-user update denied with 403.',
      securityNotes: 'Enforce ownership and role checks server-side.'
    }
  ],
  'Protected Library': [
    {
      id: 'library-access',
      label: 'Access library',
      nextState: 'Authenticated',
      screen: 'Protected Library',
      route: 'GET /movies',
      method: 'GET',
      requestPayload: null,
      responsePayload: { movies: [{ id: 1, title: 'Hypertube Demo Movie' }] },
      status: 200,
      errorCode: '',
      userMessage: 'Protected library loaded.',
      qaTestCase: 'LIB-HP-001: Authenticated users access movies.',
      securityNotes: 'Use access token verification and session expiry checks.'
    }
  ],
  Logout: [
    {
      id: 'logout',
      label: 'Execute logout',
      nextState: 'Logged Out',
      screen: 'Logout',
      route: 'POST /auth/logout',
      method: 'POST',
      requestPayload: { refreshToken: 'mock.refresh' },
      responsePayload: null,
      status: 204,
      errorCode: '',
      userMessage: 'Logged out successfully.',
      qaTestCase: 'LOGOUT-HP-001: Logout invalidates session.',
      securityNotes: 'Invalidate refresh token and clear client session storage.'
    }
  ]
};

const stateByScreen = {
  Landing: 'Anonymous',
  Login: 'Login Form',
  Register: 'Register Form',
  'OAuth 42': 'OAuth Redirect',
  'OAuth Provider': 'OAuth Redirect',
  'Forgot Password': 'Password Reset',
  'Reset Password': 'Password Reset',
  Profile: 'Profile Editing',
  Logout: 'Logged Out'
};

const authStates = new Set(['Authenticated', 'Profile Editing']);

const appState = {
  currentState: 'Anonymous',
  currentScreen: 'Landing',
  userAction: 'Initialized simulator',
  timeline: [],
  isAuthenticated: false,
  lastAction: {
    id: 'init',
    label: 'Initialize',
    nextState: 'Anonymous',
    screen: 'Landing',
    route: 'GET /',
    method: 'GET',
    requestPayload: null,
    responsePayload: { ok: true },
    status: 200,
    errorCode: '',
    userMessage: 'Simulator ready.',
    qaTestCase: 'BOOT-001: Dashboard loads.',
    securityNotes: 'No sensitive data should be persisted in local simulation logs.'
  }
};

function renderScreen() {
  const list = document.getElementById('screenList');
  list.innerHTML = '';

  screens.forEach((screen) => {
    const btn = document.createElement('button');
    btn.className = `screen-card ${appState.currentScreen === screen ? 'active-screen' : ''}`;
    btn.textContent = screen;
    btn.addEventListener('click', () => openScreen(screen));
    list.appendChild(btn);
  });

  const simulator = document.getElementById('simulator');
  simulator.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = `${appState.currentScreen} Screen`;
  simulator.appendChild(title);

  if (appState.currentScreen === 'Login') {
    const form = document.createElement('div');
    form.className = 'form-grid';
    form.innerHTML = `
      <input id="loginIdentity" placeholder="username/email" value="user@hypertube.dev" />
      <input id="loginPassword" type="password" placeholder="password" value="strongpassword" />
    `;
    simulator.appendChild(form);
  }

  const actions = flows[appState.currentScreen] || [];
  const actionList = document.createElement('div');
  actionList.className = 'action-list';

  if (!actions.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Select a flow action from other screens to drive transitions.';
    actionList.appendChild(empty);
  }

  actions.forEach((action) => {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.textContent = action.label;
    btn.addEventListener('click', () => transition(action));
    actionList.appendChild(btn);
  });

  simulator.appendChild(actionList);
}

function renderStateMachine() {
  const host = document.getElementById('stateMachine');
  host.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrow');
  marker.setAttribute('markerWidth', '8');
  marker.setAttribute('markerHeight', '8');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '4');
  marker.setAttribute('orient', 'auto');
  const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrowPath.setAttribute('d', 'M0,0 L8,4 L0,8 Z');
  arrowPath.setAttribute('fill', '#3a537f');
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const findNode = (id) => stateNodes.find((n) => n.id === id);

  edges.forEach(([from, to]) => {
    const a = findNode(from);
    const b = findNode(to);
    if (!a || !b) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${a.x}%`);
    line.setAttribute('y1', `${a.y}%`);
    line.setAttribute('x2', `${b.x}%`);
    line.setAttribute('y2', `${b.y}%`);
    line.setAttribute('stroke', '#2f466f');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(line);
  });

  host.appendChild(svg);

  stateNodes.forEach((node) => {
    const el = document.createElement('div');
    el.className = `node ${node.id === appState.currentState ? 'active' : ''}`;
    el.style.left = `${node.x}%`;
    el.style.top = `${node.y}%`;
    el.textContent = node.id;
    host.appendChild(el);
  });
}

function renderInspector() {
  const i = appState.lastAction;
  const fields = [
    ['Current State', appState.currentState],
    ['Current Screen', appState.currentScreen],
    ['User Action', appState.userAction],
    ['Route', i.route || '-'],
    ['HTTP Method', i.method || '-'],
    ['Request Payload', toCode(i.requestPayload)],
    ['Response Payload', toCode(i.responsePayload)],
    ['HTTP Status', i.status ?? '-'],
    ['Error Code', i.errorCode || '-'],
    ['User Message', i.userMessage || '-'],
    ['QA Test Case', i.qaTestCase || '-'],
    ['Security Notes', i.securityNotes || '-']
  ];

  const inspector = document.getElementById('inspector');
  inspector.innerHTML = '';

  fields.forEach(([k, v]) => {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    if (k.includes('Payload')) {
      const pre = document.createElement('pre');
      pre.textContent = v;
      dd.appendChild(pre);
    } else {
      dd.textContent = String(v);
    }
    inspector.append(dt, dd);
  });
}

function renderTimeline() {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';

  [...appState.timeline].reverse().forEach((entry) => {
    const li = document.createElement('li');
    const tagType = entry.status >= 400 ? 'error' : 'ok';
    li.innerHTML = `
      <strong>${entry.time}</strong> — ${entry.action}
      <span class="tag ${tagType}">${entry.status}</span>
      <div>${entry.fromState} → ${entry.toState} (${entry.route})</div>
      <small>${entry.message}</small>
    `;
    timeline.appendChild(li);
  });
}

function transition(action) {
  const applied = resolveAction(action);

  const fromState = appState.currentState;
  appState.currentState = applied.nextState;
  appState.currentScreen = applied.screen;
  appState.userAction = applied.label;
  appState.lastAction = applied;
  appState.isAuthenticated = authStates.has(applied.nextState);

  appState.timeline.push({
    id: crypto.randomUUID(),
    time: new Date().toLocaleTimeString(),
    action: applied.label,
    fromState,
    toState: applied.nextState,
    route: applied.route,
    status: applied.status,
    message: applied.userMessage || 'No message'
  });

  rerender();
}

function resolveAction(action) {
  const clone = structuredClone(action);

  if (clone.id === 'login-valid') {
    const login = document.getElementById('loginIdentity')?.value?.trim() || 'user@hypertube.dev';
    const password = document.getElementById('loginPassword')?.value || 'strongpassword';
    clone.requestPayload = { login, password };
  }

  if (clone.id === 'login-invalid') {
    const login = document.getElementById('loginIdentity')?.value?.trim() || 'wrong@example.com';
    clone.requestPayload = { login, password: 'incorrect' };
  }

  if (clone.id === 'login-missing-password') {
    const login = document.getElementById('loginIdentity')?.value?.trim() || 'user@hypertube.dev';
    clone.requestPayload = { login };
  }

  if (clone.id === 'library-access' && !appState.isAuthenticated) {
    clone.nextState = 'Unauthorized';
    clone.status = 401;
    clone.errorCode = 'UNAUTHORIZED';
    clone.responsePayload = { error: { code: 'UNAUTHORIZED', message: 'Please sign in to continue.' } };
    clone.userMessage = 'Please sign in to continue.';
    clone.qaTestCase = 'LIB-AUTH-002: Anonymous access returns 401 and Unauthorized state.';
    clone.securityNotes = 'Never expose protected resources before auth checks pass.';
  }

  return clone;
}

function openScreen(screen) {
  appState.currentScreen = screen;
  appState.userAction = `Open ${screen}`;

  if (stateByScreen[screen]) {
    appState.currentState = stateByScreen[screen];
    appState.isAuthenticated = authStates.has(appState.currentState);
  }

  appState.lastAction = {
    id: `open-${screen}`,
    label: `Open ${screen}`,
    nextState: appState.currentState,
    screen,
    route: `GET /${screen.toLowerCase().replace(/\s+/g, '-')}`,
    method: 'GET',
    requestPayload: null,
    responsePayload: { view: screen },
    status: 200,
    errorCode: '',
    userMessage: `${screen} screen opened.`,
    qaTestCase: `NAV-001: ${screen} card opens the expected screen.`,
    securityNotes: 'UI navigation itself should not leak protected data.'
  };

  rerender();
}

function resetSimulation() {
  appState.currentState = 'Anonymous';
  appState.currentScreen = 'Landing';
  appState.userAction = 'Reset simulation';
  appState.timeline = [];
  appState.isAuthenticated = false;
  appState.lastAction = {
    id: 'reset',
    label: 'Reset simulation',
    nextState: 'Anonymous',
    screen: 'Landing',
    route: 'GET /',
    method: 'GET',
    requestPayload: null,
    responsePayload: { reset: true },
    status: 200,
    errorCode: '',
    userMessage: 'Simulation reset to Anonymous / Landing.',
    qaTestCase: 'RESET-001: Reset clears timeline and state.',
    securityNotes: 'Session simulation data should be fully cleared.'
  };

  rerender();
}

function exportTimeline() {
  const data = {
    exportedAt: new Date().toISOString(),
    currentState: appState.currentState,
    currentScreen: appState.currentScreen,
    lastAction: appState.lastAction,
    timeline: appState.timeline
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hypertube-auth-flow-log.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCode(data) {
  return data === null || data === undefined ? 'null' : JSON.stringify(data, null, 2);
}

function rerender() {
  renderScreen();
  renderStateMachine();
  renderInspector();
  renderTimeline();
}

document.getElementById('resetBtn').addEventListener('click', resetSimulation);
document.getElementById('exportBtn').addEventListener('click', exportTimeline);

rerender();
