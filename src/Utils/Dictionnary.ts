export interface IKeyedCollection<T> {
    Add(key: string, value: T);
    ContainsKey(key: string): boolean;
    Count(): number;
    Item(key: string): T;
    Keys(): string[];
    Remove(key: string): T;
    Values(): ValueReturn<T>[];
}

interface ValueReturn<T>{
    Key: string;
    Value: T;
}

export class Dictionary<T> implements IKeyedCollection<T> {
    private items: { [index: string]: T } = {};
 
    private count: number = 0;
 
    public ContainsKey(key: string): boolean {
        return this.items.hasOwnProperty(key);
    }
 
    public Count(): number {
        return this.count;
    }
 
    public Add(key: string, value: T) {
        this.items[key] = value;
        this.count++;
    }
 
    public Remove(key: string): T {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }
 
    public Item(key: string): T {
        return this.items[key];
    }
 
    public Keys(): string[] {
        var keySet: string[] = [];
 
        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(prop);
            }
        }
 
        return keySet;
    }
 
    public Values(): ValueReturn<T>[] {
        var values: ValueReturn<T>[] = [];
 
        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push({ 
                    Key: prop,
                    Value: this.items[prop]
                } as ValueReturn<T>);
            }
        }
 
        return values;
    }

    public GetObjectByPropertyValue(property:string, value:any): T{
        var objects = this.Values();
        
        for(var i = 0, ii = objects.length; i < ii; i++){
            var item = objects[i].Value;
            if(item[property] == value){
                return item;
            }
        }

        return undefined;
    }
}