import { inject } from "@angular/core";
import { CanActivateFn, Router } from '@angular/router';
import { Store } from "@ngrx/store";
import { AppState } from "../../store";
import { signOut } from "../../store/session/actions/session.actions";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const store = inject(Store<AppState>)
  const session = localStorage.getItem('session')
  if (session != null) {
      const sessionObj = JSON.parse(session)
      if (sessionObj) {
          return true
      }
  }
  router.navigate(["session/login"])
  store.dispatch(signOut())
  return false
}

export const authGuardCustomer: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const store = inject(Store<AppState>)

  const session = localStorage.getItem('session')
  if (session) {
      const sessionObj = JSON.parse(session)
      if (sessionObj && sessionObj.role == "CLIENTE") {
          return true
      }
  }
  router.navigate(["session/login"])
  store.dispatch(signOut())
  return false};
