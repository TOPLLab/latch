// import {setTimeout} from 'timers/promises';

export type Action<T> = () => Promise<T>;

// export class Action<R> {
//     private readonly act: () => Promise<string>;
//     private readonly parser: (text: string) => R;
//
//     constructor(act: () => Promise<string>, parser: (text: string) => R) {
//         this.act = act;
//         this.parser = parser;
//     }
//
//     public do(): Promise<R> {
//         return new Promise<R>((resolve, reject) => {
//             this.act().then((data: string) => {
//                 resolve(this.parser(data));
//             }).catch((reason) => {
//                 reject(reason);
//             });
//         });
//     }
// }

// export function wait(time: number): Action<boolean> {
//     return () => setTimeout(time).then(() => true)
// }
