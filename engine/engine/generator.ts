import { Config } from './config';

/**
 * JIT Generator - Dinamik CSS Üretici
 * 
 * Örnek: "md:hover:text-center" -> CSS kodu
 * 
 * @param className - Kullanıcının yazdığı class ismi (örn: "md:hover:text-center")
 * @param cssMap - Utility class'ların CSS kodlarını içeren Map
 * @param config - Breakpoint ve variant tanımları
 * @returns Üretilen CSS kodu veya null (eğer class bulunamazsa)
 */



export function generateCSS(className: string, /* cssMap: Map<string, string>, config: Config */) {
    const parts = className.split(':')
    const baseClass = parts[parts.length - 1];
    console.log("baseClass", baseClass)
}


const cssString = ".flex-col-reverse{flex-direction:column-reverse}.flex-wrap-nowrap{flex-wrap:nowrap}.flex-wrap-wrap{flex-wrap:wrap}.flex-wrap-wrap-reverse{flex-wrap:wrap-reverse}.flex-auto{flex:auto}.flex-initial{flex:0 auto}.flex-none{flex:none}.flex-0{flex:0}.flex-px{flex:1px}.flex-0\.5{flex:.125rem}.flex-1{flex:.25rem}.flex-1\.5{flex:.375rem}.flex-2{flex:.5rem}.flex-2\.5{flex:.625rem}.flex-3{flex:.75rem}.flex-3\.5{flex:.875rem}.flex-4{flex:1rem}.flex-5{flex:1.25rem}.flex-6{flex:1.5rem}.flex-7{flex:1.75rem}.flex-8{flex:2rem}.flex-9{flex:2.25rem}.flex-10{flex:2.5rem}.flex-11{flex:2.75rem}.flex-12{flex:3rem}.flex-14{flex:3.5rem}.flex-16{flex:4rem}.flex-20{flex:5rem}.flex-24{flex:6rem}.flex-28{flex:7rem}.flex-32{flex:8rem}.flex-36{flex:9rem}.flex-40{flex:10rem}.flex-44{flex:11rem}.flex-48{flex:12rem}.flex-52{flex:13rem}.flex-56{flex:14rem}.flex-60{flex:15rem}.flex-64{flex:16rem}.flex-72{flex:18rem}.flex-80{flex:20rem}.flex-96{flex:24rem}.flex-1\/2{flex:50%}.flex-1\/3{flex:33.333333%}.flex-2\/3{flex:66.666667%}.flex-1\/4{flex:25%}.flex-2\/4{flex:50%}.flex-3\/4{flex:75%}.flex-1\/5{flex:20%}.flex-2\/5{flex:40%}.flex-3\/5{flex:60%}.flex-4\/5{flex:80%}.flex-1\/6{flex:16.666667%}.flex-2\/6{flex:33.333333%}.flex-3\/6{flex:50%}.flex-4\/6{flex:66.666667%}.flex-5\/6{flex:83.333333%}.flex-1\/12{flex:8.333333%}.flex-2\/12{flex:16.666667%}.flex-3\/12{flex:25%}.flex-4\/12{flex:33.333333%}.flex-5\/12{flex:41.666667%}.flex-6\/12{flex:50%}.flex-7\/12{flex:58.333333%}.flex-8\/12{flex:66.666667%}.flex-9\/12{flex:75%}.flex-10\/12{flex:83.333333%}.flex-11\/12{flex:91.666667%}.grow{flex-grow:1}.grow-0{flex-grow:0}.flex-shrink{flex-shrink:1}.flex-shrink-0{flex-shrink:0}.order-first{order:-9999}.order-last{order:9999}.order-none{order:0}.order-0{order:0}.order-1{order:1}.order-2{order:2}.order-3{order:3}.order-4{order:4}.order-5{order:5}.order-6{order:6}.order-7{order:7}.order-8{order:8}.order-9{order:9}.-order-last{order:-9999}.-order-1{order:-1}.-order-2{order:-2}.-order-3{order:-3}.-order-4{order:-4}.-order-5{order:-5}.-order-6{order:-6}.-order-7{order:-7}.-order-8{order:-8}.-order-9{order:-9}.order-first{order:-9999}.order-last{order:9999}.order-none{order:0}.order-0{order:0}.order-1{order:1}.order-2{order:2}.order-3{order:3}.order-4{order:4}.order-5{order:5}.order-6{order:6}.order-7{order:7}.order-8{order:8}.order-9{order:9}.basis-3xs{flex-basis:16rem}.basis-2xs{flex-basis:18rem}.basis-xs{flex-basis:20rem}.basis-sm{flex-basis:24rem}.basis-md{flex-basis:28rem}.basis-lg{flex-basis:32rem}.basis-xl{flex-basis:36rem}.basis-2xl{flex-basis:42rem}";

generateCSS(cssString);