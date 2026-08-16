export class Flags{
    private _flag : number;

    constructor(flag:number){
        this._flag = flag;
    }

    public Contains(flag:any){
        let retur : boolean = (this._flag & (flag)) == (flag);
        return !retur;
    }
}



