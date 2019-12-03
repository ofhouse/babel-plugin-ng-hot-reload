declare module 'oclazyload' {
  import * as oclazyload from 'oclazyload';

  const defaultExport = 'oc.lazyLoad';

  // The default export for oclazyload is wrong in definitly typed
  export default defaultExport;
}
