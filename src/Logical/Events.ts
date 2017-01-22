import { Dictionary } from './../Utils/Dictionnary';

export class Events {

    private _lEvents : Dictionary<number>;

    constructor(){
        this.Reset();
    }

    public Reset() : void{
        this._lEvents = new Dictionary<number>();
    }

    public ScheduleEvent(index:number, value:number) : void{
        this._lEvents.Add(index.toString(), value);
    }

    public Update(physicType) : void{
        let eventsTemp = new Dictionary<number>();
        this._lEvents.Values().forEach(item => {
            let timer : number = this._lEvents.Item(item.Key) - physicType;
            eventsTemp.Add(item.Key, (timer <= 0) ? 0 : timer);
        });
        this._lEvents = eventsTemp;
    }

    public ExecuteEvent() : number{
        let key = this._lEvents.Values().find(x => x.Value <= 0);
        if (key == undefined || (key.Value == 0 && key.Key == "0"))
            return -1;
    
        this._lEvents.Remove(key.Key);
        return parseInt(key.Key);
    }
}