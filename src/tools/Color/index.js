class Color {
    constructor(r, g, b, a) {
        this.colors = {
            r: r,
            g: g,
            b: b,
            a: a
        };
    }

    toHTML() {
        return this.colors.a
            ? 'rgba(' + this.colors.r + ',' + this.colors.g + ',' + this.colors.b + ',' + this.colors.a + ')'
            : 'rgb(' + this.colors.r + ',' + this.colors.g + ',' + this.colors.b + ')';
    }

    r() {
        return this.r;
    }

    g() {
        return this.g;
    }

    b() {
        return this.b;
    }

    a() {
        return this.a;
    }

    rgb() {
      return this.colors;
    }

    fromObject(o) {
        if (!o) {
            return transparent;
        }

        this.colors = o.colors;

        return this;
    }
}

const transparent = new Color(255, 255, 255, 0);
const black = new Color(0, 0, 0);
const white = new Color(255, 255, 255);
const grey = new Color(128, 128, 128);
const lightGrey = new Color(192, 192, 192);

export {
    Color as default,
    transparent,
    black,
    white,
    grey,
    lightGrey
};
