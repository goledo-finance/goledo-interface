import { createMachine } from 'xstate';

const AuthConnectMachine = createMachine({
  id: 'AuthConnect',
  initial: 'notActive',
  states: {
    notInstalled: {},
    notActive: {
      on: {
        connect: 'inActivating'
      }
    },
    inActivating: {
      on: {
        notMatchChain: 'switchChain',
        matchChain: 'active',
        failed: 'notActive'
      }
    },
    switchChain: {
      on: {
        failed: 'switchChain',
        success: 'active'
      },
    },
    active: {
      on: {
        changeChain: 'switchChain',
      }
    }
  }
});

export default AuthConnectMachine;