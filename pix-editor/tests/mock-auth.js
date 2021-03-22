import Service from '@ember/service';

export function mockAuthService(token) {
  let currentToken = token;
  const AuthService = class extends Service {
    get key() {
      return currentToken;
    }
    set key(value) {
      currentToken = value;
    }
  };
  this.owner.register('service:auth', AuthService);
}
