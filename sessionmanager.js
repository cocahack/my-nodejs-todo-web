class SessionManager {
  constructor() {
    this.sessionStorage = new Map();
    this.maxAge = (process.env.NODE_ENV === 'development' ? 5 : 1 * 60 * 60) * 1000;
  }

  setSession(sessionId, userId, establishedTime) {
    this.sessionStorage.set(sessionId, {userId, establishedTime});
  }

  isValidSession(sessionId) {
    return this.sessionStorage.has(sessionId) && 
    (new Date().getTime()) - parseInt(this.sessionStorage.get(sessionId).establishedTime) <= this.maxAge;
  }

  getMaxAge() {
    return this.maxAge / 1000;
  }

  getUserId(sessionId) {
    return this.sessionStorage.get(sessionId).userId;
  }

  removeSession(sessionId) {
    this.sessionStorage.delete(sessionId);
  }
}

const sessionManager = new SessionManager();


module.exports= sessionManager;